import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Loader2, Plus, RefreshCw, Server, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusMonitor = () => {
  const [checks, setChecks] = useState([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/status`);
      // Sort by timestamp descending (newest first)
      const sortedChecks = response.data.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setChecks(sortedChecks);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch status checks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(`${API}/status`, { client_name: clientName });
      toast.success("Status check created successfully");
      setClientName("");
      fetchChecks();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create status check");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchChecks();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="app-title">
              <Server className="h-8 w-8 text-primary" />
              System Status Monitor
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring of client status checks
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchChecks} 
            disabled={loading}
            className="w-full md:w-auto"
            data-testid="refresh-button"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Status
          </Button>
        </header>

        <div className="grid gap-8 md:grid-cols-[350px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>New Check</CardTitle>
              <CardDescription>
                Initiate a new status check for a client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="new-check-form">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter client name..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={submitting}
                    data-testid="client-name-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !clientName.trim()}
                  data-testid="create-check-button"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Check
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Checks</CardTitle>
              <CardDescription>
                History of system status verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && checks.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : checks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="no-checks-message">
                  No status checks found. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4" data-testid="checks-list">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      data-testid={`check-item-${check.id}`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span data-testid={`check-client-${check.id}`}>{check.client_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {check.id}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span data-testid={`check-timestamp-${check.id}`}>
                          {format(new Date(check.timestamp), "MMM d, HH:mm:ss")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusMonitor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
