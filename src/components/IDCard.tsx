import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { usePhotoUrl } from "@/hooks/use-photo-url";

interface IDCardProps {
  type: "enrollee" | "dependant";
  data: {
    cin?: string;
    full_name: string;
    date_of_birth: string;
    gender: string;
    blood_group?: string;
    phone_number?: string;
    relationship?: string;
    enrollee_cin?: string;
    photo_url?: string;
  };
  isPrinting?: boolean;
}

export function IDCard({ type, data, isPrinting = false }: IDCardProps) {
  const cardId = type === "enrollee" ? data.cin : `${data.enrollee_cin}-DEP`;
  const photoUrl = usePhotoUrl(data.photo_url);
  
  return (
    <div className={`id-card ${isPrinting ? 'print-mode' : ''}`}>
      <Card className="id-card-content bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary">
        <div className="id-card-header bg-primary text-primary-foreground px-4 py-2">
          <h3 className="text-sm font-bold">Health Insurance Commission</h3>
          <p className="text-xs">{type === "enrollee" ? "Primary Enrollee" : "Dependant"}</p>
        </div>
        
        <div className="id-card-body p-4 space-y-3">
          <div className="flex gap-4">
            {photoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={photoUrl} 
                  alt={data.full_name}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold text-sm">{data.full_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm">{data.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">DOB</p>
                  <p className="text-sm">{new Date(data.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
              
              {type === "enrollee" && data.blood_group && (
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="text-sm font-semibold">{data.blood_group}</p>
                </div>
              )}
              
              {type === "dependant" && data.relationship && (
                <div>
                  <p className="text-xs text-muted-foreground">Relationship</p>
                  <p className="text-sm">{data.relationship}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <QRCodeSVG value={cardId || ""} size={80} level="H" />
              <p className="text-xs mt-1 font-mono">{cardId}</p>
            </div>
          </div>
          
          {data.phone_number && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="text-sm">{data.phone_number}</p>
            </div>
          )}
        </div>
        
        <div className="id-card-footer bg-muted px-4 py-1">
          <p className="text-xs text-center text-muted-foreground">
            For official use only • Keep this card safe
          </p>
        </div>
      </Card>
    </div>
  );
}
