import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { UserType, Language } from '@/lib/types';

export default function AddBeneficiaryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Profile fields often handled after initial registration or via updateProfile
    // But for initial "Add Beneficiary" as Admin, we mainly need Identity info.
    // If backend supports full profile creation in one go, we use that.
    // register() takes RegisterDto: email, phone, password, fullName, userType, language.
    // Additional info (dateOfBirth, location, etc) would need to be updated after creation 
    // OR strict backend endpoint for 'create beneficiary profile' which handles user creation too.
    // Based on beneficiary.service.ts -> createProfile takes CreateBeneficiaryDto which implies USER already exists or it creates one?
    // Actually beneficiaryService.createProfile hits /beneficiaries/profile (POST). Usually that's for "me" (logged in user).
    // Admin creating a beneficiary usually means creating the basic User account first.
    // We will stick to creating the User Identity first. The beneficiary can complete profile later, 
    // OR we ideally chain: Register User -> Login as Admin (still) -> (Maybe Admin cannot fill beneficiary profile?)
    // Let's assume Admin creates the Account.
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: UserType.BENEFICIARY,
        language: Language.EN // Default or select
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Beneficiary Account Created!</span>
          <span className="text-xs">They can now log in to complete their profile.</span>
        </div>
      );
      navigate('/admin/beneficiaries');

    } catch (error: any) {
      console.error("Registration failed", error);
      toast.error(error.response?.data?.message || "Failed to create beneficiary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/beneficiaries')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Beneficiary</h1>
          <p className="text-muted-foreground">
            Create a new beneficiary account
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-3xl border-2 border-[#4c9789]/20">
          <CardHeader className="bg-gradient-to-br from-[#4c9789]/5 to-[#eacfa2]/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#4c9789] flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Beneficiary Account</CardTitle>
                <CardDescription>
                  Enter core identity details. The beneficiary will complete their full profile upon login.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Identity Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Jane Uwase"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane.uwase@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+250 788 123 456"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Account Security
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Share this password with the beneficiary securely.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/beneficiaries')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#4c9789] hover:bg-[#3d7a6e]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
