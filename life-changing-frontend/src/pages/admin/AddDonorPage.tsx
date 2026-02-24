import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { authService } from '@/services/auth.service';
import { adminService } from '@/services/admin.service';
import { UserType, Currency, ReceiptPreference } from '@/lib/types';

export default function AddDonorPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    donorType: '',
    country: '',
    city: '',
    address: '',
    preferredCommunication: '',
    interests: [] as string[],
    notes: ''
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
      // 1. Register User
      const authResponse = await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        userType: UserType.DONOR,
      });

      // 2. Create Donor Profile
      if (authResponse.user && authResponse.user.id) {
        const interestsString = formData.interests.length > 0 ? `Interests: ${formData.interests.join(', ')}\n` : '';

        await adminService.createDonorProfile(authResponse.user.id, {
          donorType: formData.donorType,
          organizationName: formData.organization,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          preferredCurrency: Currency.USD, // Defaulting for now
          communicationPreferences: {
            email: ['email', 'both'].includes(formData.preferredCommunication),
            phone: ['phone', 'both'].includes(formData.preferredCommunication),
            sms: false,
            post: formData.preferredCommunication === 'mail',
          },
          receiptPreference: ReceiptPreference.EMAIL, // Default
          anonymityPreference: false,
          receiveNewsletter: true,
          notes: interestsString + formData.notes
        });

        toast.success('Donor added successfully!');
        navigate('/admin/donors');
      } else {
        throw new Error("User registration failed to return user ID.");
      }

    } catch (error: any) {
      console.error("Failed to add donor", error);
      toast.error(error.response?.data?.message || "Failed to add donor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const programInterests = [
    'Education & School Retention',
    'Entrepreneurship & Business',
    'Health & Wellness',
    'Mental Health & Resilience',
    'Women\'s Empowerment',
    'Community Development'
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/donors')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Donor</h1>
          <p className="text-muted-foreground">
            Create a new donor account manually
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
              <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Donor Information</CardTitle>
                <CardDescription>
                  Fill in the details to create a new donor account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal/Organization Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Personal/Organization Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name / Organization Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Smith or ABC Foundation"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donorType">Donor Type *</Label>
                    <Select onValueChange={(value) => handleChange('donorType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select donor type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                        <SelectItem value="FOUNDATION">Foundation</SelectItem>
                        <SelectItem value="GOVERNMENT">Government/Institution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (if applicable)</Label>
                  <Input
                    id="organization"
                    placeholder="Company or organization name"
                    value={formData.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Contact Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.smith@example.com"
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
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredCommunication">Preferred Communication Method</Label>
                  <Select onValueChange={(value) => handleChange('preferredCommunication', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="both">Both Email & Phone</SelectItem>
                      <SelectItem value="mail">Postal Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Location Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address, P.O. Box, etc."
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>

              {/* Program Interests Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#4c9789] border-b pb-2">
                  Program Interests
                </h3>

                <div className="space-y-3">
                  <Label>Select areas of interest (optional)</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {programInterests.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={formData.interests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <label
                          htmlFor={interest}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {interest}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about the donor..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
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
                      Password will be sent to the donor via email
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
                  onClick={() => navigate('/admin/donors')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Add Donor
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
