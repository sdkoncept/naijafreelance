import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import PhotoCapture from "@/components/PhotoCapture";

const dependantSchema = z.object({
  first_name: z.string().trim().min(2, "First name is required").max(50),
  middle_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().min(2, "Last name is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  relationship: z.enum(["Spouse", "Child", "Parent", "Other"]),
  phone_number: z
    .string()
    .regex(/^\d{11}$/, "Phone number must be exactly 11 digits")
    .optional()
    .or(z.literal("")),
  address: z.string().max(500).optional(),
  genotype: z.enum(["AA", "AS", "SS"]).optional().or(z.literal("")),
  allergies: z.string().max(500).optional(),
});

interface DependantFormProps {
  enrolleeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DependantForm({ enrolleeId, onSuccess, onCancel }: DependantFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    relationship: "",
    phone_number: "",
    address: "",
    genotype: "",
    allergies: "",
    photo_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = dependantSchema.parse(formData);

      const insertData = {
        enrollee_id: enrolleeId,
        first_name: validatedData.first_name,
        middle_name: validatedData.middle_name || null,
        last_name: validatedData.last_name,
        date_of_birth: validatedData.date_of_birth,
        gender: validatedData.gender,
        relationship: validatedData.relationship,
        phone_number: validatedData.phone_number || null,
        address: validatedData.address || null,
        genotype: (validatedData.genotype as any) || null,
        allergies: validatedData.allergies || null,
        photo_url: formData.photo_url || null,
      };
      
      const { data, error } = await supabase
        .from("dependants")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      
      // Generate CIN for the dependant
      if (data && data.id) {
        const enrolleeCIN = (await supabase
          .from("enrollees")
          .select("cin")
          .eq("id", enrolleeId)
          .single()).data?.cin;
          
        if (enrolleeCIN) {
          const { data: cinData, error: cinError } = await supabase.rpc("generate_dependant_cin", {
            enrollee_cin: enrolleeCIN
          });
          
          if (!cinError && cinData) {
            await supabase
              .from("dependants")
              .update({ cin: cinData })
              .eq("id", data.id);
          }
        }
      }

      // Log dependant creation
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const { error: logError } = await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action: "dependant_create",
          table_name: "dependants",
          record_id: data.id,
          new_data: insertData,
        }]);
        if (logError) console.error("Failed to log action:", logError);
      }

      toast.success("Dependant added successfully!");
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to add dependant");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
      <h3 className="font-semibold">Add New Dependant</h3>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="dep_first_name">First Name *</Label>
          <Input
            id="dep_first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_middle_name">Middle Name</Label>
          <Input
            id="dep_middle_name"
            value={formData.middle_name}
            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_last_name">Last Name *</Label>
          <Input
            id="dep_last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            maxLength={50}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dep_date_of_birth">Date of Birth *</Label>
          <Input
            id="dep_date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_relationship">Relationship *</Label>
          <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Child">Child</SelectItem>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_phone_number">Phone Number</Label>
          <Input
            id="dep_phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            maxLength={11}
            placeholder="08012345678"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dep_address">Address</Label>
        <Textarea
          id="dep_address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          maxLength={500}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dep_genotype">Genotype</Label>
          <Select value={formData.genotype} onValueChange={(value) => setFormData({ ...formData, genotype: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select genotype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AA">AA</SelectItem>
              <SelectItem value="AS">AS</SelectItem>
              <SelectItem value="SS">SS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dep_allergies">Allergies</Label>
          <Textarea
            id="dep_allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            maxLength={500}
          />
        </div>
      </div>

      <div className="space-y-2">
        <PhotoCapture
          onPhotoCapture={(url) => setFormData({ ...formData, photo_url: url })}
          currentPhotoUrl={formData.photo_url}
          label="Dependant Photo"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          Add Dependant
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
