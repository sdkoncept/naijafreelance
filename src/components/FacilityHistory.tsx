import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface FacilityHistoryEntry {
  id: string;
  old_facility: string;
  new_facility: string;
  changed_at: string;
  changed_by: string | null;
  changer_name?: string;
}

interface FacilityHistoryProps {
  enrolleeId: string;
  currentFacility: string;
}

export function FacilityHistory({ enrolleeId, currentFacility }: FacilityHistoryProps) {
  const [history, setHistory] = useState<FacilityHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [enrolleeId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facility_history')
        .select(`
          id,
          old_facility,
          new_facility,
          changed_at,
          changed_by,
          profiles:changed_by (
            full_name
          )
        `)
        .eq('enrollee_id', enrolleeId)
        .order('changed_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(entry => ({
        ...entry,
        changer_name: (entry.profiles as any)?.full_name || 'System'
      })) || [];

      setHistory(formattedData);
    } catch (error) {
      console.error('Error fetching facility history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facility History</CardTitle>
          <CardDescription>Loading history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facility History</CardTitle>
          <CardDescription>Track all facility assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No facility changes recorded yet.</p>
            <p className="text-sm mt-2">Current facility: <span className="font-medium">{currentFacility}</span></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facility History</CardTitle>
        <CardDescription>All facility assignments for this enrollee</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current facility banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-primary">Current Facility</p>
            <p className="text-lg font-semibold mt-1">{currentFacility}</p>
          </div>

          {/* History timeline */}
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="px-2 py-1 bg-destructive/10 text-destructive rounded">
                        {entry.old_facility}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {entry.new_facility}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(entry.changed_at), 'PPp')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Changed by: {entry.changer_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
