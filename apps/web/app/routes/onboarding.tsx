import { redirect, type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Spinner } from "~/components/ui/spinner";
import { createOrganization, joinOrganization, listOrganizations } from "~/lib/api/organization/organizations";
import { setSessionUser } from "~/lib/session";
import { toast } from "sonner";
import { Plus, Users, ArrowRight, CheckCircle } from "lucide-react";

interface User {
  email: string;
  name?: string;
  [key: string]: any;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Keep route loadable for SSR but don't hard-require query params.
  // Client component handles parsing and validation.
  try {
    const url = new URL(request.url);
    const apiKey = url.searchParams.get("apiKey");
    const userParam = url.searchParams.get("user");
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      // Fetch orgs for convenience; apiKey is optional (cookie session may exist)
      const orgs = await listOrganizations({ email: user.email });
      return { user, apiKey, orgs };
    }
  } catch (error) {
    console.error("Onboarding loader parse error:", error);
  }
  return null;
}

export default function OnboardingPage() {
  const loader = useLoaderData() as null | { user: User; apiKey?: string; orgs?: { id: string; name: string }[] };
  const navigate = useNavigate();
  const [step, setStep] = useState<'choice' | 'create' | 'join' | 'success'>('choice');
  const [actionType, setActionType] = useState<'create' | 'join' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [invitationId, setInvitationId] = useState('');

  // Parse URL parameters on component mount
  useEffect(() => {
    setPageLoading(false);
  }, []);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    // Basic domain validation
    if (orgDomain.trim() && !orgDomain.trim().includes('.')) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const apiKey = urlParams.get('apiKey');
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const result = await createOrganization({
        apikey: apiKey,
        body: {
          name: orgName.trim(),
          description: orgDescription.trim() || 'Leave management organization',
          domain: orgDomain.trim() || 'example.com'
        }
      });

      toast.success(`Organization "${orgName.trim()}" created successfully!`);
      setActionType('create');
      setStep('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = async () => {
    if (!invitationId.trim()) {
      setError('Invitation ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const apiKey = urlParams.get('apiKey');
      
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // For now, we'll need to get the org ID from the invitation
      // This might need to be adjusted based on your backend implementation
      const result = await joinOrganization({
        apikey: apiKey,
        orgId: invitationId.trim(),
        body: {}
      });

      toast.success('Successfully joined the organization!');
      setActionType('join');
      setStep('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join organization';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleContinue = () => {
    // If user info present in URL, persist to session for sidebar
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const u = JSON.parse(decodeURIComponent(userParam));
        setSessionUser({ name: u?.name ?? null, email: u?.email ?? null, avatarUrl: u?.avatarUrl ?? null });
      } catch {}
    }
    navigate('/dashboard');
  };

  // Show loading state while parsing URL parameters
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-700">Setting up your account...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we prepare everything for you</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
            <p className="text-gray-600 mb-6">
              {actionType === 'create' ? 
                'Your organization has been created successfully. You\'re now ready to start managing leaves.' :
                'You\'ve successfully joined the organization. You\'re now ready to start managing leaves.'
              }
            </p>
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Organization
            </CardTitle>
            <CardDescription>
              Set up your new organization for leave management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name *</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Enter organization name"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleCreateOrg();
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description</Label>
              <Textarea
                id="orgDescription"
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                placeholder="Brief description of your organization"
                disabled={loading}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgDomain">Domain</Label>
              <Input
                id="orgDomain"
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                placeholder="example.com"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('choice')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateOrg}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join Organization
            </CardTitle>
            <CardDescription>
              Join an existing organization using an invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitationId">Invitation ID *</Label>
              <Input
                id="invitationId"
                value={invitationId}
                onChange={(e) => setInvitationId(e.target.value)}
                placeholder="Enter invitation ID"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleJoinOrg();
                  }
                }}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('choice')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleJoinOrg}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Joining...
                  </>
                ) : (
                  'Join Organization'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main choice step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Leave Management
          </CardTitle>
          <CardDescription className="text-lg">
            Let's get you set up with an organization to start managing leaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loader?.orgs && loader.orgs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-base font-medium text-gray-800">Organizations available for {loader.user.email}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {loader.orgs.map((o) => (
                  <Card key={o.id} className="p-4 flex items-center justify-between">
                    <span className="font-medium">{o.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          setActionType('join');
                          const params = new URLSearchParams(window.location.search);
                          const apiKey = loader?.apiKey || params.get('apiKey') || '';
                          await joinOrganization({ apikey: apiKey, orgId: o.id });
                          toast.success(`Joined ${o.name}`);
                          setStep('success');
                        } catch (e) {
                          const m = e instanceof Error ? e.message : 'Failed to join organization';
                          setError(m);
                          toast.error(m);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Join
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Organization Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStep('create')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Organization</h3>
                <p className="text-gray-600 mb-4">
                  Start fresh with your own organization and invite team members
                </p>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Join Organization Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStep('join')}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Existing Organization</h3>
                <p className="text-gray-600 mb-4">
                  Join an organization you've been invited to
                </p>
                <Button variant="outline" className="w-full">
                  Join Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button variant="ghost" onClick={handleSkip} className="text-gray-500 hover:text-gray-700">
              Skip for now
            </Button>
            <p className="text-sm text-gray-400 mt-1">
              You can set up an organization later from your dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
