import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Check, Heart, CreditCard, Smartphone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockPrograms } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function DonorDashboardDonation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [donationData, setDonationData] = useState({
    program: '',
    type: 'recurring',
    frequency: 'monthly',
    amount: '',
    customAmount: '',
    anonymous: false,
    message: '',
    paymentMethod: '',
  });

  const totalSteps = 4; // Removed email collection step since user is already logged in
  const progress = (step / totalSteps) * 100;

  const suggestedAmounts = [25, 50, 100, 250, 500, 1000];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Complete donation
      toast.success("Donation processed successfully! Thank you for your generosity.");
      navigate('/donor');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateImpact = (amount: number) => {
    return {
      schoolSupplies: Math.floor(amount / 25),
      monthsOfMentorship: Math.floor(amount / 50),
      businessSeedCapital: Math.floor(amount / 200),
    };
  };

  const selectedAmount = parseInt(donationData.amount || donationData.customAmount || '0');
  const impact = calculateImpact(selectedAmount);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Program Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Choose Where to Make an Impact</CardTitle>
                <CardDescription>
                  Select a program to support or donate to where needed most
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    donationData.program === 'general'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDonationData({ ...donationData, program: 'general' })}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Where Needed Most</h3>
                      <p className="text-sm text-muted-foreground">
                        Your donation will be allocated to programs with the greatest need, ensuring maximum impact.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {mockPrograms.slice(0, 3).map((program) => (
                    <div
                      key={program.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        donationData.program === program.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDonationData({ ...donationData, program: program.id })}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{program.name.en}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {program.description.en}
                          </p>
                          <Badge variant="secondary" className="mt-2">{program.category}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleNext} 
                    disabled={!donationData.program}
                    className="bg-gradient-to-r from-primary to-primary/90"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Amount & Frequency */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Choose Your Donation Amount</CardTitle>
                <CardDescription>
                  Select a one-time or recurring donation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type */}
                <div>
                  <Label className="mb-3 block">Donation Type</Label>
                  <RadioGroup
                    value={donationData.type}
                    onValueChange={(value) => setDonationData({ ...donationData, type: value })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="one-time" id="one-time" className="peer sr-only" />
                      <Label
                        htmlFor="one-time"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <span className="font-semibold">One-Time</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="recurring" id="recurring" className="peer sr-only" />
                      <Label
                        htmlFor="recurring"
                        className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <span className="font-semibold">Monthly</span>
                        <Badge variant="secondary" className="mt-1 text-xs">Recommended</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Amount Selection */}
                <div>
                  <Label className="mb-3 block">Select Amount (USD)</Label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {suggestedAmounts.map((amount) => (
                      <div
                        key={amount}
                        onClick={() => setDonationData({ ...donationData, amount: amount.toString(), customAmount: '' })}
                        className={`p-4 border-2 rounded-lg cursor-pointer text-center font-semibold transition-all hover:shadow-md ${
                          donationData.amount === amount.toString()
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        ${amount}
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="custom-amount" className="mb-2 block text-sm">Or enter custom amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={donationData.customAmount}
                      onChange={(e) => setDonationData({ ...donationData, customAmount: e.target.value, amount: '' })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Impact Preview */}
                {selectedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 p-6 rounded-lg border border-primary/20"
                  >
                    <h4 className="font-semibold mb-4 text-primary">Your Impact</h4>
                    <div className="space-y-2 text-sm">
                      {impact.schoolSupplies > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{impact.schoolSupplies}x school supply kits</span>
                        </div>
                      )}
                      {impact.monthsOfMentorship > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{impact.monthsOfMentorship} months of mentorship</span>
                        </div>
                      )}
                      {impact.businessSeedCapital > 0 && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>{impact.businessSeedCapital}x business seed capital grants</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline">Back</Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!selectedAmount}
                    className="bg-gradient-to-r from-primary to-primary/90"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Payment Method */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Choose Payment Method</CardTitle>
                <CardDescription>
                  Select how you'd like to make your donation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={donationData.paymentMethod}
                  onValueChange={(value) => setDonationData({ ...donationData, paymentMethod: value })}
                  className="grid gap-4"
                >
                  {[
                    { value: 'card', icon: CreditCard, label: 'Credit/Debit Card', description: 'Visa, Mastercard, Amex' },
                    { value: 'mobile', icon: Smartphone, label: 'Mobile Money', description: 'MTN, Airtel' },
                    { value: 'bank', icon: Building, label: 'Bank Transfer', description: 'Direct bank transfer' },
                  ].map((method) => (
                    <div key={method.value}>
                      <RadioGroupItem value={method.value} id={method.value} className="peer sr-only" />
                      <Label
                        htmlFor={method.value}
                        className="flex items-center gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <method.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline">Back</Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!donationData.paymentMethod}
                    className="bg-gradient-to-r from-primary to-primary/90"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Review Your Donation</CardTitle>
                <CardDescription>
                  Please review your donation details before confirming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program</span>
                    <span className="font-semibold">
                      {donationData.program === 'general' ? 'Where Needed Most' : 
                        mockPrograms.find(p => p.id === donationData.program)?.name.en}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Donation Type</span>
                    <span className="font-semibold capitalize">{donationData.type === 'recurring' ? 'Monthly' : 'One-Time'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-xl text-primary">${selectedAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold capitalize">{donationData.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-primary/5 p-4 rounded-lg">
                  <Checkbox 
                    id="anonymous"
                    checked={donationData.anonymous}
                    onCheckedChange={(checked) => 
                      setDonationData({ ...donationData, anonymous: checked as boolean })
                    }
                    className="mt-1"
                  />
                  <label htmlFor="anonymous" className="text-sm cursor-pointer">
                    Make this donation anonymous (your name will not be displayed publicly)
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button onClick={handleBack} variant="outline">Back</Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-primary to-primary/90"
                  >
                    Complete Donation <Heart className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
