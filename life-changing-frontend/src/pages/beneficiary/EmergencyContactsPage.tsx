// pages/beneficiary/EmergencyContactsPage.tsx
import { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  User,
  MapPin,
  Heart,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  ChevronRight,
  PhoneCall,
  Star,
  Users,
  Clock,
  Sparkles,
  Smartphone,
  Search,
  Filter,
  X,
  Save,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { beneficiaryService } from '@/services/beneficiary.service';

// Types based on Swagger
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string | null;
  address?: string | null;
  isPrimary: boolean;
  beneficiary?: {
    id: string;
    businessType: string;
    location: {
      district: string;
      sector: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface CreateEmergencyContactDto {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  isPrimary?: boolean;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Relationship types for badges
const relationshipColors: Record<string, string> = {
  family: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  friend: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  colleague: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  neighbor: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  doctor: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
  spouse: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
  parent: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
  sibling: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400',
  other: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
};

// Relationship options for form
const relationshipOptions = [
  { value: 'spouse', label: 'Spouse', icon: '💑' },
  { value: 'parent', label: 'Parent', icon: '👪' },
  { value: 'sibling', label: 'Sibling', icon: '👥' },
  { value: 'child', label: 'Child', icon: '👶' },
  { value: 'friend', label: 'Friend', icon: '🤝' },
  { value: 'neighbor', label: 'Neighbor', icon: '🏠' },
  { value: 'colleague', label: 'Colleague', icon: '💼' },
  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
  { value: 'other', label: 'Other', icon: '📌' }
];

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [primaryOnly, setPrimaryOnly] = useState(false);

  // Dialog states
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    alternatePhone: '',
    address: '',
    isPrimary: false
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);

    try {
      const response = await beneficiaryService.getEmergencyContacts();
      const responseData = response as any;
      const contactsData = responseData.data?.data || responseData.data || responseData;
      const contactsList: EmergencyContact[] = Array.isArray(contactsData) ? contactsData : [];
      setContacts(contactsList);
    } catch (error: any) {
      console.error('Failed to fetch contacts', error);
      toast.error('Failed to load emergency contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phone: '',
      alternatePhone: '',
      address: '',
      isPrimary: false
    });
    setEditingContact(null);
  };

  // Open dialog for editing
  const openEditDialog = async (contact: EmergencyContact) => {
    setEditingContact(contact);

    // Fetch fresh data if needed (optional - you can use the contact object directly)
    try {
      const response = await beneficiaryService.getEmergencyContactById(contact.id);
      const responseData = response as any;
      const contactData = responseData.data || responseData;

      if (contactData) {
        setFormData({
          name: contactData.name || '',
          relationship: contactData.relationship || '',
          phone: contactData.phone || '',
          alternatePhone: contactData.alternatePhone || '',
          address: contactData.address || '',
          isPrimary: contactData.isPrimary || false
        });
      }
    } catch (error) {
      console.error('Failed to fetch contact details', error);
      toast.error('Failed to load contact details');
      return;
    }

    setIsContactDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    if (!formData.relationship) {
      toast.error('Please select a relationship');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setSubmitting(true);

    try {
      // Build payload dynamically to match DTO
      const payload: any = {
        name: formData.name.trim(),
        relationship: formData.relationship,
        phone: formData.phone.trim(),
        address: formData.address || '',
        isPrimary: formData.isPrimary
      };

      // Only add alternatePhone if it has a value
      if (formData.alternatePhone?.trim()) {
        payload.alternatePhone = formData.alternatePhone.trim();
      }

      if (editingContact) {
        await beneficiaryService.updateEmergencyContact(editingContact.id, payload);
        toast.success('Contact updated successfully');
      } else {
        await beneficiaryService.addEmergencyContact(payload);
        toast.success('Emergency contact added successfully');
      }

      setIsContactDialogOpen(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error('Failed to save contact', error);
      toast.error(editingContact ? 'Failed to update contact' : 'Failed to add contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;

    try {
      await beneficiaryService.deleteEmergencyContact(selectedContact.id);
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  const setAsPrimary = async (contactId: string) => {
    try {
      await beneficiaryService.setPrimaryContact(contactId);

      // Update local state
      setContacts(prev => prev.map(c => ({
        ...c,
        isPrimary: c.id === contactId
      })));

      toast.success('Primary contact updated');
    } catch (error) {
      toast.error('Failed to update primary contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' ||
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      (contact.alternatePhone?.includes(searchTerm) || false) ||
      contact.relationship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesRelationship = relationshipFilter === 'all' || contact.relationship === relationshipFilter;
    const matchesPrimary = !primaryOnly || contact.isPrimary;

    return matchesSearch && matchesRelationship && matchesPrimary;
  });

  const stats = {
    total: contacts.length,
    primary: contacts.filter(c => c.isPrimary).length,
    withAlternate: contacts.filter(c => c.alternatePhone).length,
    withAddress: contacts.filter(c => c.address).length
  };

  // Get unique relationships for filter
  const uniqueRelationships = Array.from(new Set(contacts.map(c => c.relationship)));

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
              <Heart className="w-16 h-16 text-rose-600 relative animate-bounce" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading your emergency contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Emergency Contacts
                </h1>
                <Badge variant="outline" className="ml-2 text-xs font-medium bg-white/80 dark:bg-slate-900/80">
                  {stats.total} Total
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Heart className="w-4 h-4" />
                <span>People to contact in case of emergency</span>
              </p>
            </div>

            <Button
              className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              onClick={() => {
                resetForm();
                setIsContactDialogOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Add Contact
            </Button>

          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Contacts</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                    <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Primary Contact</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.primary}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Alt. Phone</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.withAlternate}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">With Address</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.withAddress}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, relationship..."
                  className="w-full h-10 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Relationship" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all">All Relationships</SelectItem>
                    {uniqueRelationships.map(rel => (
                      <SelectItem key={rel} value={rel} className="capitalize">
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={primaryOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrimaryOnly(!primaryOnly)}
                  className={cn(
                    "h-10 px-4 text-xs font-medium",
                    primaryOnly && "bg-amber-600 hover:bg-amber-700 text-white"
                  )}
                >
                  <Star className={cn("w-4 h-4 mr-2", primaryOnly ? "text-white" : "text-amber-600")} />
                  Primary Only
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Contacts Grid */}
          <motion.div variants={fadeInUp}>
            {filteredContacts.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl" />
                      <Heart className="w-16 h-16 text-slate-300 dark:text-slate-600 relative" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-400 dark:text-slate-600">
                        No emergency contacts found
                      </p>
                      <p className="text-sm text-slate-400">
                        {searchTerm || relationshipFilter !== 'all' || primaryOnly
                          ? 'Try adjusting your filters'
                          : 'Add your first emergency contact to keep them handy'}
                      </p>
                    </div>


                    <Button
                      className="mt-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-6"
                      onClick={() => {
                        resetForm();
                        setIsContactDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Emergency Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredContacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      variants={fadeInUp}
                      layout
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className={cn(
                        "h-full border hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden relative", // Added 'relative' for absolute positioned badge
                        contact.isPrimary
                          ? "border-amber-200 dark:border-amber-800 ring-2 ring-amber-500/20"
                          : "border-slate-200 dark:border-slate-800"
                      )}>
                        {contact.isPrimary && (
                          <div className="absolute top-3 right-3 z-10"> {/* Added z-index */}
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                              <Star className="w-3 h-3 mr-1 fill-white" />
                              Primary
                            </Badge>
                          </div>
                        )}

                        {/* Card content - No changes needed here, the padding comes from CardHeader and CardContent */}
                        <CardHeader className="p-5 pb-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-800 shadow-md flex-shrink-0"> {/* Added flex-shrink-0 */}
                              <AvatarFallback className={cn(
                                "text-white font-bold text-lg",
                                contact.isPrimary ? "bg-amber-500" : "bg-rose-500"
                              )}>
                                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold line-clamp-1">
                                {contact.name}
                              </CardTitle>
                              <Badge
                                className={cn(
                                  "mt-1 px-2 py-0.5 text-[10px] font-medium capitalize",
                                  relationshipColors[contact.relationship] || relationshipColors.other
                                )}
                              >
                                {contact.relationship}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-5 pt-0 space-y-3">
                          {/* Phone */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0"> {/* Added flex-shrink-0 */}
                              <Phone className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0"> {/* Added min-w-0 */}
                              <p className="text-xs text-slate-500">Primary Phone</p>
                              <p className="font-medium truncate">{contact.phone}</p> {/* Added truncate */}
                            </div>
                          </div>

                          {/* Alternate Phone */}
                          {contact.alternatePhone && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                <Smartphone className="w-4 h-4 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500">Alternate Phone</p>
                                <p className="font-medium truncate">{contact.alternatePhone}</p>
                              </div>
                            </div>
                          )}

                          {/* Address */}
                          {contact.address && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                <MapPin className="w-4 h-4 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500">Address</p>
                                <p className="font-medium truncate">{contact.address}</p>
                              </div>
                            </div>
                          )}

                          {/* Added Date */}
                          <div className="flex items-center gap-3 text-sm pt-1">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                              <Clock className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500">Added</p>
                              <p className="font-medium text-sm">
                                {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-9 text-xs border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                  onClick={() => window.open(`tel:${contact.phone}`)}
                                >
                                  <PhoneCall className="w-3.5 h-3.5 mr-1.5" />
                                  Call
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Call {contact.name}</TooltipContent>
                            </Tooltip>

                            {!contact.isPrimary && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-9 text-xs border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                    onClick={() => setAsPrimary(contact.id)}
                                  >
                                    <Star className="w-3.5 h-3.5 mr-1.5" />
                                    Set Primary
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Set as primary contact</TooltipContent>
                              </Tooltip>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(contact)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(contact)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Create/Edit Contact Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsContactDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[600px] w-[95%] md:w-full p-0">
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                
                    <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                      {editingContact ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContact
                      ? 'Update your emergency contact details'
                      : 'Add someone to contact in case of emergency'}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        placeholder="e.g., Marie Uwase"
                        className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label htmlFor="relationship" className="text-sm font-medium">
                      Relationship <span className="text-rose-500">*</span>
                    </Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => handleChange('relationship', value)}
                      required
                    >
                      <SelectTrigger className="border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="mr-2">{option.icon}</span>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Primary Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        placeholder="+250 788 123 456"
                        className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Include country code for international numbers
                    </p>
                  </div>

                  {/* Alternate Phone (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="alternatePhone" className="text-sm font-medium">
                      Alternate Phone <span className="text-slate-400">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="alternatePhone"
                        placeholder="+250 788 123 457"
                        className="pl-9 border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                        value={formData.alternatePhone}
                        onChange={(e) => handleChange('alternatePhone', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Address (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address <span className="text-slate-400">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Textarea
                        id="address"
                        placeholder="e.g., Kigali, Rwanda"
                        className="pl-9 min-h-[80px] border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:ring-rose-500/20"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Primary Contact Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Star className={cn(
                        "w-5 h-5 mt-0.5",
                        formData.isPrimary ? "text-amber-500" : "text-slate-400"
                      )} />
                      <div>
                        <Label htmlFor="isPrimary" className="text-sm font-medium">
                          Set as Primary Contact
                        </Label>
                        <p className="text-xs text-slate-500">
                          This person will be contacted first in case of emergency
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="isPrimary"
                      checked={formData.isPrimary}
                      onCheckedChange={(checked) => handleChange('isPrimary', checked)}
                      className="data-[state=checked]:bg-amber-600"
                    />
                  </div>

                  {/* Tips */}
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-rose-800 dark:text-rose-300">Important</p>
                        <ul className="text-xs text-rose-600 dark:text-rose-400 mt-1 space-y-1 list-disc list-inside">
                          <li>Ensure the phone number is correct and reachable</li>
                          <li>You can only have one primary contact</li>
                          <li>Update contact details if they change</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsContactDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="contact-form"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingContact ? 'Update Contact' : 'Save Contact'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Delete Contact</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedContact?.name} from your emergency contacts?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
}