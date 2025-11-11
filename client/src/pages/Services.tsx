import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Wrench, FileText } from "lucide-react";
import type { ServiceRequest, Pedestal } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Services() {
  const [requestType, setRequestType] = useState<string>("maintenance");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<string>("normal");
  const [pedestalId, setPedestalId] = useState<string>("");
  const { toast } = useToast();

  const { data: serviceRequests, isLoading: requestsLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const { data: pedestals } = useQuery<Pedestal[]>({
    queryKey: ["/api/pedestals"],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/service-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      setDescription("");
      setPedestalId("");
      toast({
        title: "Request Submitted",
        description: "Your service request has been submitted successfully.",
      });
    },
  });

  const handleSubmit = () => {
    if (!description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a description.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      userId: "demo-user-id",
      pedestalId: pedestalId || null,
      requestType,
      description,
      urgency,
      status: "pending",
    });
  };

  const myRequests = serviceRequests || [];

  if (requestsLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-32" />
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-full" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          Service Requests
        </h1>

        <Card data-testid="card-request-form">
          <CardHeader>
            <CardTitle>Submit New Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="request-type">Request Type</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger id="request-type" data-testid="select-request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="general">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="pedestal-select">Pedestal/Berth Number (Optional)</Label>
              <Select value={pedestalId} onValueChange={setPedestalId}>
                <SelectTrigger id="pedestal-select" data-testid="select-pedestal">
                  <SelectValue placeholder="Select a berth (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {pedestals?.map((pedestal) => (
                    <SelectItem key={pedestal.id} value={pedestal.id}>
                      Berth {pedestal.berthNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue or request in detail..."
                className="min-h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="textarea-description"
              />
            </div>

            <div className="space-y-3">
              <Label>Urgency Level</Label>
              <RadioGroup value={urgency} onValueChange={setUrgency}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="normal" id="normal" data-testid="radio-normal" />
                  <Label htmlFor="normal" className="cursor-pointer">
                    Normal - Can wait for regular service
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="urgent" id="urgent" data-testid="radio-urgent" />
                  <Label htmlFor="urgent" className="cursor-pointer">
                    Urgent - Requires immediate attention
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full h-14"
              onClick={handleSubmit}
              disabled={createRequestMutation.isPending}
              data-testid="button-submit-request"
            >
              {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold" data-testid="text-my-requests-title">
            My Requests
          </h2>
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Wrench className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground" data-testid="text-no-requests">
                  No service requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => {
              const pedestal = request.pedestalId 
                ? pedestals?.find(p => p.id === request.pedestalId)
                : null;
              
              return (
                <Card key={request.id} data-testid={`card-request-${request.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">
                            {request.requestType}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), "PPP")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                          {request.status}
                        </Badge>
                        {request.urgency === "urgent" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    </div>
                    {pedestal && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Berth {pedestal.berthNumber}
                      </div>
                    )}
                    <p className="text-sm">{request.description}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
