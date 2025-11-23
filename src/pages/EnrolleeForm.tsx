import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Trash2 } from "lucide-react";
import PhotoCapture from "@/components/PhotoCapture";
import { FACILITIES, LGAs } from "@/constants/facilities";
import { PLAN_NAMES, ENROLLMENT_TYPES } from "@/constants/plans";
import { Separator } from "@/components/ui/separator";

// UUID validation helper
const isValidUUID = (uuid: string | null | undefined): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const validateUUIDs = (fields: Record<string, any>): void => {
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null && value !== undefined && !isValidUUID(value)) {
      throw new Error(`Invalid UUID for field "${key}": "${value}". Please ensure you're logged in and try again.`);
    }
  }
};

const enrolleeSchema = z.object({
  cin: z.string().trim().min(1, "CIN is required"),
  lga: z.string().min(1, "Please select an LGA"),
  facility: z.string().min(1, "Please select a facility"),
  health_plan: z.enum(["bronze", "silver", "formal", "enhanced", "equity"]),
  enrollment_type: z.enum(["single", "primary", "group_member"]),
  group_name: z.string().max(100).optional(),
  primary_enrollee_id: z.string().uuid().optional().or(z.literal("")),
  plan_start_date: z.string().min(1, "Plan start date is required"),
  first_name: z.string().trim().min(2, "First name is required").max(50),
  middle_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().min(2, "Last name is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  home_address: z.string().trim().min(5, "Address is required").max(500),
  phone_number: z.string().regex(/^\d{11}$/, "Phone number must be exactly 11 digits"),
  email: z.string().trim().email("Invalid email format").max(255).optional().or(z.literal("")),
  genotype: z.enum(["AA", "AS", "SS"]),
  blood_group: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]),
  allergies: z.string().max(500).optional(),
  photo_url: z.string().min(1, "Photo is required"),
});

const groupMemberSchema = z.object({
  cin: z.string().trim().min(1, "CIN is required"),
  first_name: z.string().trim().min(2, "First name is required").max(50),
  middle_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().min(2, "Last name is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  genotype: z.enum(["AA", "AS", "SS"]),
  blood_group: z.enum(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]),
  allergies: z.string().max(500).optional(),
  photo_url: z.string().min(1, "Photo is required"),
  phone_number: z.string().regex(/^\d{11}$/, "Phone number must be exactly 11 digits").optional(),
  address: z.string().trim().max(500).optional(),
});

const dependantSchema = z.object({
  first_name: z.string().trim().min(2, "First name is required").max(50),
  middle_name: z.string().trim().max(50).optional(),
  last_name: z.string().trim().min(2, "Last name is required").max(50),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  relationship: z.enum(["Spouse", "Child", "Parent", "Other"]),
  phone_number: z.string().regex(/^\d{11}$/, "Phone number must be exactly 11 digits").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  genotype: z.enum(["AA", "AS", "SS"]).optional().or(z.literal("")),
  allergies: z.string().max(500).optional(),
  photo_url: z.string().min(1, "Photo is required"),
});

type GroupMember = z.infer<typeof groupMemberSchema>;
type Dependant = z.infer<typeof dependantSchema>;

export default function EnrolleeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatingCIN, setGeneratingCIN] = useState(false);
  
  const [formData, setFormData] = useState({
    cin: "",
    registration_date: new Date().toISOString().split("T")[0],
    lga: "",
    facility: "",
    health_plan: "" as any,
    enrollment_type: "single" as "single" | "primary" | "group_member",
    group_name: "",
    primary_enrollee_id: "",
    plan_start_date: new Date().toISOString().split("T")[0],
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    home_address: "",
    phone_number: "",
    email: "",
    genotype: "",
    blood_group: "",
    allergies: "",
    photo_url: "",
  });
  
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [editingDependantIndex, setEditingDependantIndex] = useState<number | null>(null);

  const handleGenerateCIN = async () => {
    if (!paymentConfirmed) {
      toast.error("Please confirm payment before generating CIN");
      return;
    }
    
    if (!formData.health_plan || !formData.lga) {
      toast.error("Please select health plan and LGA first");
      return;
    }
    
    setGeneratingCIN(true);
    try {
      const { data, error } = await supabase.rpc("generate_enrollee_cin", {
        plan: formData.health_plan,
        lga: formData.lga
      });
      if (error) throw error;
      setFormData({ ...formData, cin: data });
      toast.success("CIN generated successfully");
    } catch (error: any) {
      toast.error("Failed to generate CIN: " + error.message);
    } finally {
      setGeneratingCIN(false);
    }
  };

  const handleGenerateGroupMemberCIN = async (primaryCIN: string) => {
    try {
      const { data, error } = await supabase.rpc("generate_dependant_cin", {
        enrollee_cin: primaryCIN
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error("Failed to generate CIN: " + error.message);
      return null;
    }
  };

  const addGroupMember = () => {
    setGroupMembers([...groupMembers, {
      cin: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "" as any,
      genotype: "" as any,
      blood_group: "" as any,
      allergies: "",
      photo_url: "",
      phone_number: "",
      address: "",
    }]);
    setEditingMemberIndex(groupMembers.length);
  };

  const removeGroupMember = (index: number) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
    if (editingMemberIndex === index) {
      setEditingMemberIndex(null);
    }
  };

  const updateGroupMember = (index: number, field: keyof GroupMember, value: any) => {
    const updated = [...groupMembers];
    updated[index] = { ...updated[index], [field]: value };
    setGroupMembers(updated);
  };

  const addDependant = () => {
    setDependants([...dependants, {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "" as any,
      relationship: "" as any,
      genotype: "",
      allergies: "",
      photo_url: "",
      phone_number: "",
      address: "",
    }]);
    setEditingDependantIndex(dependants.length);
  };

  const removeDependant = (index: number) => {
    setDependants(dependants.filter((_, i) => i !== index));
    if (editingDependantIndex === index) {
      setEditingDependantIndex(null);
    }
  };

  const updateDependant = (index: number, field: keyof Dependant, value: any) => {
    const updated = [...dependants];
    updated[index] = { ...updated[index], [field]: value };
    setDependants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        toast.error("You must be logged in to create an enrollee");
        setLoading(false);
        return;
      }

      // Validate all UUIDs before proceeding
      validateUUIDs({
        created_by: user.id,
        primary_enrollee_id: formData.enrollment_type === "group_member" ? formData.primary_enrollee_id : null,
      });

      const validatedData = enrolleeSchema.parse(formData);
      
      // Validate group members if primary
      if (formData.enrollment_type === 'primary' && groupMembers.length === 0) {
        toast.error("Please add at least one group member");
        setLoading(false);
        return;
      }

      if (formData.enrollment_type === 'primary') {
        for (let i = 0; i < groupMembers.length; i++) {
          try {
            groupMemberSchema.parse(groupMembers[i]);
          } catch (error: any) {
            toast.error(`Group Member ${i + 1}: ${error.errors[0].message}`);
            setLoading(false);
            return;
          }
        }

        // Validate dependants
        for (let i = 0; i < dependants.length; i++) {
          try {
            dependantSchema.parse(dependants[i]);
          } catch (error: any) {
            toast.error(`Dependant ${i + 1}: ${error.errors[0].message}`);
            setLoading(false);
            return;
          }
        }
      }

      const insertData: any = {
        cin: validatedData.cin,
        registration_date: formData.registration_date,
        lga: validatedData.lga,
        facility: validatedData.facility,
        health_plan: validatedData.health_plan,
        enrollment_type: validatedData.enrollment_type,
        group_name: validatedData.enrollment_type === 'primary' ? validatedData.group_name : null,
        primary_enrollee_id: validatedData.enrollment_type === 'group_member' && validatedData.primary_enrollee_id 
          ? validatedData.primary_enrollee_id 
          : null,
        plan_start_date: validatedData.plan_start_date,
        payment_status: paymentConfirmed ? ("confirmed" as const) : ("pending" as const),
        payment_date: paymentConfirmed ? new Date().toISOString() : null,
        payment_reference: paymentReference || null,
        first_name: validatedData.first_name,
        middle_name: validatedData.middle_name || null,
        last_name: validatedData.last_name,
        date_of_birth: validatedData.date_of_birth,
        gender: validatedData.gender,
        home_address: validatedData.home_address,
        phone_number: validatedData.phone_number,
        email: validatedData.email || null,
        genotype: validatedData.genotype,
        blood_group: validatedData.blood_group,
        allergies: validatedData.allergies || null,
        photo_url: validatedData.photo_url,
        created_by: user.id,
      };

      const { data: insertedEnrollee, error } = await supabase
        .from("enrollees")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // If primary enrollee, create group members
      if (formData.enrollment_type === 'primary' && insertedEnrollee) {
        // Validate UUIDs for group members
        validateUUIDs({
          primary_enrollee_id: insertedEnrollee.id,
          created_by: user.id,
        });

        for (const member of groupMembers) {
          const memberData = {
            cin: member.cin,
            lga: validatedData.lga,
            facility: validatedData.facility,
            health_plan: validatedData.health_plan,
            enrollment_type: 'group_member' as const,
            primary_enrollee_id: insertedEnrollee.id,
            plan_start_date: validatedData.plan_start_date,
            payment_status: paymentConfirmed ? ("confirmed" as const) : ("pending" as const),
            payment_date: paymentConfirmed ? new Date().toISOString() : null,
            payment_reference: paymentReference || null,
            first_name: member.first_name,
            middle_name: member.middle_name || null,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth,
            gender: member.gender,
            home_address: member.address || validatedData.home_address,
            phone_number: member.phone_number || validatedData.phone_number,
            email: null,
            genotype: member.genotype,
            blood_group: member.blood_group,
            allergies: member.allergies || null,
            photo_url: member.photo_url,
            created_by: user.id,
          };

          const { error: memberError } = await supabase
            .from("enrollees")
            .insert(memberData);

          if (memberError) {
            console.error("Failed to create group member:", memberError);
            toast.error(`Failed to create group member: ${member.first_name} ${member.last_name}`);
          }
        }

        // Create dependants
        for (const dependant of dependants) {
          const { data: dependantData, error: dependantError } = await supabase
            .from("dependants")
            .insert({
              enrollee_id: insertedEnrollee.id,
              first_name: dependant.first_name,
              middle_name: dependant.middle_name || null,
              last_name: dependant.last_name,
              date_of_birth: dependant.date_of_birth,
              gender: dependant.gender,
              relationship: dependant.relationship,
              phone_number: dependant.phone_number || null,
              address: dependant.address || null,
              genotype: dependant.genotype || null,
              allergies: dependant.allergies || null,
              photo_url: dependant.photo_url,
            })
            .select()
            .single();

          if (dependantError) {
            console.error("Failed to create dependant:", dependantError);
            toast.error(`Failed to create dependant: ${dependant.first_name} ${dependant.last_name}`);
          } else if (dependantData && insertedEnrollee.cin) {
            // Generate CIN for dependant
            const { data: cinData, error: cinError } = await supabase.rpc("generate_dependant_cin", {
              enrollee_cin: insertedEnrollee.cin
            });
            
            if (!cinError && cinData) {
              await supabase.from("dependants").update({ cin: cinData }).eq("id", dependantData.id);
            }

            // Log dependant creation
            await supabase.from("audit_logs").insert([{
              user_id: user.id,
              action: "dependant_create",
              table_name: "dependants",
              record_id: dependantData.id,
              new_data: dependantData,
            }]);
          }
        }
      }

      // Validate UUIDs for audit log
      validateUUIDs({
        user_id: user.id,
        record_id: insertedEnrollee?.id || null,
      });

      await supabase.from("audit_logs").insert([{
        user_id: user.id,
        action: "enrollee_create",
        table_name: "enrollees",
        record_id: insertedEnrollee?.id || null,
        new_data: insertData,
      }]);

      toast.success("Enrollee registered successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to register enrollee:", error);
      
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if ((error as any).message) {
        // Show detailed PostgreSQL/Supabase error
        const errorMsg = (error as any).message;
        const errorDetails = (error as any).details;
        const errorHint = (error as any).hint;
        
        let fullMessage = errorMsg;
        if (errorDetails) fullMessage += `\n${errorDetails}`;
        if (errorHint) fullMessage += `\n${errorHint}`;
        
        toast.error(fullMessage);
      } else {
        toast.error("Failed to register enrollee");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Enrollee Registration</h2>
        <p className="text-muted-foreground">Fill in the enrollee details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Office Information */}
        <Card>
          <CardHeader>
            <CardTitle>Office Information</CardTitle>
            <CardDescription>Basic registration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cin">CIN *</Label>
                <div className="flex gap-2">
                  <Input
                    id="cin"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    required
                    disabled={generatingCIN}
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateCIN}
                    disabled={generatingCIN || !paymentConfirmed}
                  >
                    {generatingCIN && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_date">Registration Date</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga">LGA *</Label>
                <Select value={formData.lga} onValueChange={(value) => setFormData({ ...formData, lga: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {LGAs.map((lga) => (
                      <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facility">Facility *</Label>
                <Select value={formData.facility} onValueChange={(value) => setFormData({ ...formData, facility: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITIES.map((facility) => (
                      <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Plan & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Health Plan & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="health_plan">Health Plan *</Label>
                <Select value={formData.health_plan} onValueChange={(value: any) => setFormData({ ...formData, health_plan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLAN_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_type">Enrollment Type *</Label>
                <Select value={formData.enrollment_type} onValueChange={(value: any) => setFormData({ ...formData, enrollment_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENROLLMENT_TYPES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.enrollment_type === 'primary' && (
                <div className="space-y-2">
                  <Label htmlFor="group_name">Group Name *</Label>
                  <Input
                    id="group_name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    placeholder="Enter group name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="plan_start_date">Plan Start Date *</Label>
                <Input
                  id="plan_start_date"
                  type="date"
                  value={formData.plan_start_date}
                  onChange={(e) => setFormData({ ...formData, plan_start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_reference">Payment Reference</Label>
                <Input
                  id="payment_reference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Enter payment reference"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="payment_confirmed"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="payment_confirmed" className="cursor-pointer">
                Payment Confirmed
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Group Members (for Primary Enrollees) */}
        {formData.enrollment_type === 'primary' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>Add members being paid for under this primary enrollee</CardDescription>
                </div>
                <Button type="button" onClick={addGroupMember} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No group members added yet. Click "Add Member" to begin.
                </p>
              ) : (
                <div className="space-y-4">
                  {groupMembers.map((member, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Member {index + 1}
                            {member.first_name && ` - ${member.first_name} ${member.last_name}`}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMemberIndex(editingMemberIndex === index ? null : index)}
                            >
                              {editingMemberIndex === index ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGroupMember(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {editingMemberIndex === index && (
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>CIN *</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={member.cin}
                                  onChange={(e) => updateGroupMember(index, 'cin', e.target.value)}
                                  required
                                  disabled={!formData.cin}
                                />
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    if (!formData.cin) {
                                      toast.error("Please generate primary enrollee CIN first");
                                      return;
                                    }
                                    const cin = await handleGenerateGroupMemberCIN(formData.cin);
                                    if (cin) {
                                      updateGroupMember(index, 'cin', cin);
                                    }
                                  }}
                                  disabled={!formData.cin}
                                  size="sm"
                                >
                                  Generate
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>First Name *</Label>
                              <Input
                                value={member.first_name}
                                onChange={(e) => updateGroupMember(index, 'first_name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Middle Name</Label>
                              <Input
                                value={member.middle_name}
                                onChange={(e) => updateGroupMember(index, 'middle_name', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Last Name *</Label>
                              <Input
                                value={member.last_name}
                                onChange={(e) => updateGroupMember(index, 'last_name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Date of Birth *</Label>
                              <Input
                                type="date"
                                value={member.date_of_birth}
                                onChange={(e) => updateGroupMember(index, 'date_of_birth', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Gender *</Label>
                              <Select
                                value={member.gender}
                                onValueChange={(value: any) => updateGroupMember(index, 'gender', value)}
                              >
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
                              <Label>Genotype *</Label>
                              <Select
                                value={member.genotype}
                                onValueChange={(value: any) => updateGroupMember(index, 'genotype', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select genotype" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["AA", "AS", "SS"].map((gt) => (
                                    <SelectItem key={gt} value={gt}>{gt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Blood Group *</Label>
                              <Select
                                value={member.blood_group}
                                onValueChange={(value: any) => updateGroupMember(index, 'blood_group', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input
                                value={member.phone_number}
                                onChange={(e) => updateGroupMember(index, 'phone_number', e.target.value)}
                                placeholder="11 digits"
                                maxLength={11}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Address</Label>
                              <Input
                                value={member.address}
                                onChange={(e) => updateGroupMember(index, 'address', e.target.value)}
                                placeholder="Optional address"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Allergies</Label>
                            <Textarea
                              value={member.allergies}
                              onChange={(e) => updateGroupMember(index, 'allergies', e.target.value)}
                              maxLength={500}
                              placeholder="List any known allergies"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Photo *</Label>
                            <PhotoCapture
                              onPhotoCapture={(url) => updateGroupMember(index, 'photo_url', url)}
                              currentPhotoUrl={member.photo_url}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dependants (for Primary Enrollees) */}
        {formData.enrollment_type === 'primary' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dependants</CardTitle>
                  <CardDescription>Add family members and dependants for the primary enrollee</CardDescription>
                </div>
                <Button type="button" onClick={addDependant} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Dependant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dependants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No dependants added yet. Click "Add Dependant" to begin.
                </p>
              ) : (
                <div className="space-y-4">
                  {dependants.map((dependant, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Dependant {index + 1}
                            {dependant.first_name && ` - ${dependant.first_name} ${dependant.last_name} (${dependant.relationship})`}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDependantIndex(editingDependantIndex === index ? null : index)}
                            >
                              {editingDependantIndex === index ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeDependant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {editingDependantIndex === index && (
                        <CardContent className="space-y-4 pt-0">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>First Name *</Label>
                              <Input
                                value={dependant.first_name}
                                onChange={(e) => updateDependant(index, 'first_name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Middle Name</Label>
                              <Input
                                value={dependant.middle_name}
                                onChange={(e) => updateDependant(index, 'middle_name', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Last Name *</Label>
                              <Input
                                value={dependant.last_name}
                                onChange={(e) => updateDependant(index, 'last_name', e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Date of Birth *</Label>
                              <Input
                                type="date"
                                value={dependant.date_of_birth}
                                onChange={(e) => updateDependant(index, 'date_of_birth', e.target.value)}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Gender *</Label>
                              <Select 
                                value={dependant.gender} 
                                onValueChange={(value) => updateDependant(index, 'gender', value)}
                              >
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
                              <Label>Relationship *</Label>
                              <Select 
                                value={dependant.relationship} 
                                onValueChange={(value) => updateDependant(index, 'relationship', value)}
                              >
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
                              <Label>Phone Number</Label>
                              <Input
                                type="tel"
                                value={dependant.phone_number}
                                onChange={(e) => updateDependant(index, 'phone_number', e.target.value)}
                                maxLength={11}
                                placeholder="08012345678"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea
                              value={dependant.address}
                              onChange={(e) => updateDependant(index, 'address', e.target.value)}
                              maxLength={500}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Genotype</Label>
                              <Select 
                                value={dependant.genotype || ""} 
                                onValueChange={(value) => updateDependant(index, 'genotype', value)}
                              >
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
                              <Label>Allergies</Label>
                              <Textarea
                                value={dependant.allergies}
                                onChange={(e) => updateDependant(index, 'allergies', e.target.value)}
                                maxLength={500}
                                placeholder="List any known allergies"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Photo *</Label>
                            <PhotoCapture
                              onPhotoCapture={(url) => updateDependant(index, 'photo_url', url)}
                              currentPhotoUrl={dependant.photo_url}
                            />
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
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
            </div>

            <div className="space-y-2">
              <PhotoCapture
                onPhotoCapture={(url) => setFormData({ ...formData, photo_url: url })}
                currentPhotoUrl={formData.photo_url}
                label="Enrollee Photo *"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home_address">Home Address *</Label>
              <Textarea
                id="home_address"
                value={formData.home_address}
                onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                required
                maxLength={500}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                  maxLength={11}
                  placeholder="08012345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={255}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="genotype">Genotype *</Label>
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
                <Label htmlFor="blood_group">Blood Group *</Label>
                <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                maxLength={500}
                placeholder="List any known allergies"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading || !formData.photo_url}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Enrollee
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
