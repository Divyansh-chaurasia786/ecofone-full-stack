'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useRouter } from 'next/navigation';

interface FranchiseApp {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  locationPreference: string;
  investmentCapacity: number;
  experienceDesc: string;
  status: string;
  createdAt: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  type: string;
  mapsUrl?: string;
  createdAt: string;
}

const extractCoordsFromMapsUrl = (url: string) => {
  const standardRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const queryRegex = /[?&](query|q)=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const placeRegex = /\/place\/(-?\d+\.\d+)[+,](-?\d+\.\d+)/;
  const pathRegex = /\/(-?\d+\.\d+),(-?\d+\.\d+)/;
  const embedPbRegex = /!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/;

  let match = url.match(embedPbRegex);
  if (match) {
    // In Google Maps pb parameter, !2d is longitude and !3d is latitude
    return { success: true, latitude: parseFloat(match[2]), longitude: parseFloat(match[1]) };
  }
  match = url.match(standardRegex);
  if (match) {
    return { success: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  match = url.match(queryRegex);
  if (match) {
    return { success: true, latitude: parseFloat(match[2]), longitude: parseFloat(match[3]) };
  }
  match = url.match(placeRegex);
  if (match) {
    return { success: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  match = url.match(pathRegex);
  if (match) {
    return { success: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  return {
    success: false,
    message: "Could not find coordinates in this link. Make sure it's a direct Google Maps URL."
  };
};

const getMapLink = (store: Store) => {
  const url = store.mapsUrl;
  if (url && url.trim() !== '') {
    if (url.includes('google.com/maps/embed') || url.includes('/embed')) {
      return `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
    }
    return url;
  }
  return `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
};

const convertToEmbedUrl = (url: string) => {
  let cleanUrl = (url || '').trim();
  if (!cleanUrl) return '';

  if (cleanUrl.includes('<iframe')) {
    const srcMatch = cleanUrl.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      cleanUrl = srcMatch[1];
    }
  }

  return cleanUrl;
};

const MOCK_FRANCHISE_APPS: FranchiseApp[] = [
  {
    id: 'f-1',
    applicantName: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    locationPreference: 'Lucknow',
    investmentCapacity: 1500000,
    experienceDesc: '10 years in retail business',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: 'f-2',
    applicantName: 'Ananya Sen',
    email: 'ananya.sen@example.com',
    phone: '+91 91234 56789',
    locationPreference: 'Kolkata',
    investmentCapacity: 2500000,
    experienceDesc: 'Owner of multi-brand mobile franchise',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const MOCK_CONTACTS: FranchiseApp[] = [
  {
    id: 'c-1',
    applicantName: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 88888 77777',
    locationPreference: 'Lucknow HQ Inquiry',
    investmentCapacity: 0,
    experienceDesc: 'Interested in bulk purchase of refurbished iPhones',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c-2',
    applicantName: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    phone: '+91 77777 66666',
    locationPreference: 'Lucknow HQ Inquiry',
    investmentCapacity: 0,
    experienceDesc: 'Looking to tie up for wholesale spare parts supply',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const MOCK_STORES: Store[] = [
  {
    id: 's-1',
    name: 'EcoFone Lucknow Flagship Store',
    address: 'Hazratganj, Lucknow, Uttar Pradesh 226001',
    phone: '+91 99199 65499',
    latitude: 26.8467,
    longitude: 80.9462,
    mapsUrl: 'https://maps.google.com',
    type: 'LIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 's-2',
    name: 'EcoFone Gomti Nagar Store',
    address: 'Patrakar Puram, Gomti Nagar, Lucknow, UP 226010',
    phone: '+91 99199 65488',
    latitude: 26.8496,
    longitude: 80.9984,
    mapsUrl: 'https://maps.google.com',
    type: 'LIVE',
    createdAt: new Date().toISOString()
  }
];

const MOCK_REVIEWS = [
  {
    id: 'r-1',
    authorName: 'Aarav Sharma',
    rating: 5,
    comment: 'Bought an iPhone 13 in pristine condition. Battery health was 96% and doorstep delivery was super fast. Highly recommended!',
    verifiedProduct: 'iPhone 13 (128GB)',
    isVerified: true,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'r-2',
    authorName: 'Priya Verma',
    rating: 5,
    comment: 'Sold my old OnePlus phone for instant cash. The evaluation was transparent and amount credited within 5 minutes.',
    verifiedProduct: 'OnePlus 9 Pro',
    isVerified: true,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'r-3',
    authorName: 'Rohan Mehta',
    rating: 5,
    comment: 'Great service and authentic warranty coverage! The device came with official accessories and full 6-month EcoFone seal.',
    verifiedProduct: 'Samsung Galaxy S22',
    isVerified: true,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const MOCK_SUB_ADMINS = [
  {
    id: 'sa-1',
    username: 'lucknow_moderator',
    password: '',
    permissions: ['franchise', 'contact', 'reviews']
  },
  {
    id: 'sa-2',
    username: 'store_manager',
    password: '',
    permissions: ['stores', 'team']
  }
];

const MOCK_SYSTEM_LOGS = [
  {
    id: 'l-1',
    action: 'Master Admin Logged In',
    createdAt: new Date().toISOString()
  },
  {
    id: 'l-2',
    action: 'Approved Customer Review (Aarav Sharma)',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const MOCK_TEAM_MEMBERS = [
  {
    id: 't-1',
    name: 'Divyansh Chaurasia',
    role: 'Founder & CEO',
    bio: 'Visionary leader driving the sustainable re-commerce revolution in India with EcoFone.',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    order: 1
  },
  {
    id: 't-2',
    name: 'Rohan Malhotra',
    role: 'Head of Diagnostics & Quality',
    bio: 'Diagnostics expert overseeing the 32-point mobile inspection and certified seal assurance.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    order: 2
  },
  {
    id: 't-3',
    name: 'Neha Kapoor',
    role: 'Director of Franchise Operations',
    bio: 'Supports franchise partners from initial demographic survey to grand outlet launch.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    order: 3
  }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminRole, setAdminRole] = useState<'master' | 'sub-admin'>('master');
  const [subAdmins, setSubAdmins] = useState<{ id: string; username: string; password: string; permissions: string[] }[]>([]);
  
  const [subAdminUsername, setSubAdminUsername] = useState('');
  const [subAdminPassword, setSubAdminPassword] = useState('');
  const [subAdminError, setSubAdminError] = useState('');
  const [subAdminSuccess, setSubAdminSuccess] = useState('');
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>(['franchise', 'contact', 'reviews', 'certificates']);
  const [allowedPermissions, setAllowedPermissions] = useState<string[]>(['franchise', 'contact', 'stores', 'team', 'logs', 'security', 'reviews', 'certificates']);
  
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminPhoneDisplay, setAdminPhoneDisplay] = useState('+91 99199 65499');
  const [adminEmailDisplay, setAdminEmailDisplay] = useState('business@ecofone.co.in');

  // Active Tab & Sidebar mobile states
  const [activeTab, setActiveTab] = useState<'franchise' | 'contact' | 'stores' | 'team' | 'logs' | 'security' | 'reviews' | 'certificates'>('franchise');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Certificate Management states
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certFormLoading, setCertFormLoading] = useState(false);
  const [certFormError, setCertFormError] = useState('');
  const [certFormSuccess, setCertFormSuccess] = useState('');

  // Certificate Form inputs
  const [newCertType, setNewCertType] = useState('INTERNSHIP');
  const [newCertUid, setNewCertUid] = useState(() => `EVG-INT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newCertName, setNewCertName] = useState('');
  const [newCertRole, setNewCertRole] = useState('Web Development & Social Media Handling Intern');
  const todayStr = new Date().toISOString().split('T')[0];
  const [newCertStartDate, setNewCertStartDate] = useState('2024-05-01');
  const [newCertEndDate, setNewCertEndDate] = useState('2024-06-30');
  const [newCertIssueDate, setNewCertIssueDate] = useState(todayStr);
  const [newCertDesc, setNewCertDesc] = useState('Successfully completed term at Ecovista Global Private Limited.');
  const [newCertSignatory, setNewCertSignatory] = useState('Ecovista Global Private Limited');
  const [newCertOffice, setNewCertOffice] = useState('505, JB Metro Heights, Kanpur Road, Lucknow – 226012');
  const [newCertWebsite, setNewCertWebsite] = useState('www.ecofone.co.in');
  const [newCertEmail, setNewCertEmail] = useState('support@ecofone.co.in');
  const [filterFromDate, setFilterFromDate] = useState<string>(todayStr);
  const [filterToDate, setFilterToDate] = useState<string>(todayStr);

  // Print preview modal states
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [activePrintCert, setActivePrintCert] = useState<any | null>(null);

  // Dashboard datasets
  const [applications, setApplications] = useState<FranchiseApp[]>([]);
  const [contactQueries, setContactQueries] = useState<FranchiseApp[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilterStatus, setReviewFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isLoading, setIsLoading] = useState(false);

  // Download History Log
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);

  // custom lead delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalType, setDeleteModalType] = useState<'franchise' | 'contact'>('franchise');
  const [deleteModalFilter, setDeleteModalFilter] = useState<'1month' | '3months' | '1year' | 'all' | 'custom'>('1month');
  const [deleteStartDate, setDeleteStartDate] = useState('');
  const [deleteEndDate, setDeleteEndDate] = useState('');

  // edit sub-admin permissions modal states
  const [editSubAdminOpen, setEditSubAdminOpen] = useState(false);
  const [editSubAdminId, setEditSubAdminId] = useState('');
  const [editSubAdminName, setEditSubAdminName] = useState('');
  const [editSubAdminPermissions, setEditSubAdminPermissions] = useState<string[]>([]);
  const [editAccessPassword, setEditAccessPassword] = useState('');
  const [editAccessPasswordError, setEditAccessPasswordError] = useState('');

  // reset sub-admin password modal states
  const [resetSubAdminOpen, setResetSubAdminOpen] = useState(false);
  const [resetSubAdminId, setResetSubAdminId] = useState('');
  const [resetSubAdminName, setResetSubAdminName] = useState('');
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');

  // revoke sub-admin confirm modal states
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [revokeTargetId, setRevokeTargetId] = useState('');
  const [revokeTargetName, setRevokeTargetName] = useState('');
  const [revokePasswordInput, setRevokePasswordInput] = useState('');
  const [revokeSubAdminPasswordInput, setRevokeSubAdminPasswordInput] = useState('');
  const [revokePasswordError, setRevokePasswordError] = useState('');
  const [revokeErrorField, setRevokeErrorField] = useState<'master' | 'subadmin' | 'general' | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Add Store Form States
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeLat, setStoreLat] = useState('26.846694');
  const [storeLng, setStoreLng] = useState('80.946166');
  const [storeType, setStoreType] = useState('LIVE');
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [mapsUrl, setMapsUrl] = useState('');
  const [mapStatus, setMapStatus] = useState('');

  // Leaflet Map states
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapMarker, setMapMarker] = useState<any>(null);
  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Password Change States
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Status editing loaders
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Business Owner Review Modal States
  const [ownerReviewOpen, setOwnerReviewOpen] = useState(false);
  const [ownerAuthorName, setOwnerAuthorName] = useState('EcoFone Store Owner');
  const [ownerRole, setOwnerRole] = useState('Verified Business Owner');
  const [ownerRating, setOwnerRating] = useState<number>(5);
  const [ownerComment, setOwnerComment] = useState('');
  const [isSubmittingOwnerReview, setIsSubmittingOwnerReview] = useState(false);

  // Edit Review Modal States
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState('');
  const [editVerifiedProduct, setEditVerifiedProduct] = useState('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);

  // Premium Make Live Modal States
  const [makeLiveStore, setMakeLiveStore] = useState<any | null>(null);
  const [makeLiveAddress, setMakeLiveAddress] = useState('');
  const [makeLivePhone, setMakeLivePhone] = useState('');
  const [makeLiveMapsUrl, setMakeLiveMapsUrl] = useState('');
  const [makeLiveError, setMakeLiveError] = useState('');

  // Team Members State list
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Add Team Member Form States
  const [teamName, setTeamName] = useState('');
  const [teamRole, setTeamRole] = useState('');
  const [teamBio, setTeamBio] = useState('');
  const [teamImageUrl, setTeamImageUrl] = useState('');
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'url'>('upload');
  const [teamLinkedin, setTeamLinkedin] = useState('');
  const [teamTwitter, setTeamTwitter] = useState('');
  const [teamGithub, setTeamGithub] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  // Edit Team Member Modal States
  const [editTeamMember, setEditTeamMember] = useState<any | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamRole, setEditTeamRole] = useState('');
  const [editTeamBio, setEditTeamBio] = useState('');
  const [editTeamImageUrl, setEditTeamImageUrl] = useState('');
  const [editImageSourceType, setEditImageSourceType] = useState<'upload' | 'url'>('upload');
  const [editTeamLinkedin, setEditTeamLinkedin] = useState('');
  const [editTeamTwitter, setEditTeamTwitter] = useState('');
  const [editTeamGithub, setEditTeamGithub] = useState('');
  const [editTeamError, setEditTeamError] = useState('');

  // FileReader helper to convert uploaded files to Base64 data URLs
  const handleTeamFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate image format and size (max 2MB to keep DB payloads lightweight)
    if (file.size > 2 * 1024 * 1024) {
      alert('The chosen photo exceeds 2MB. Please upload a smaller image file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditTeamImageUrl(reader.result as string);
      } else {
        setTeamImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Metrics
  const [kpis, setKpis] = useState({
    franchiseCount: 0,
    contactCount: 0,
    storesCount: 0,
    pendingReviewsCount: 0,
  });

  // Drag and drop states/handlers for team reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }

    const reorderedMembers = [...teamMembers];
    const [draggedItem] = reorderedMembers.splice(draggedIndex, 1);
    reorderedMembers.splice(targetIndex, 0, draggedItem);
    
    setTeamMembers(reorderedMembers);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      await api.reorderTeamMembers(reorderedMembers.map(m => m.id));
    } catch (err) {
      console.error('Failed to persist team order:', err);
      const originalMembers = await api.getTeamMembers();
      setTeamMembers(originalMembers);
    }
  };

  const handleMoveMember = async (currentIndex: number, direction: number) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= teamMembers.length) return;

    const reorderedMembers = [...teamMembers];
    const temp = reorderedMembers[currentIndex];
    reorderedMembers[currentIndex] = reorderedMembers[targetIndex];
    reorderedMembers[targetIndex] = temp;
    
    setTeamMembers(reorderedMembers);

    try {
      await api.reorderTeamMembers(reorderedMembers.map(m => m.id));
    } catch (err) {
      console.error('Failed to persist team order:', err);
      const originalMembers = await api.getTeamMembers();
      setTeamMembers(originalMembers);
    }
  };

  const checkAdminAuth = () => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('ecofone_token') || '';
      if (token && token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = window.atob(parts[1]);
            const payload = JSON.parse(decoded);
            
            const storedRole = (sessionStorage.getItem('ecofone_admin_role') as 'master' | 'sub-admin') || (payload.role === 'SUB_ADMIN' ? 'sub-admin' : 'master');
            setAdminRole(storedRole);

            if (payload.role === 'ADMIN' || payload.role === 'SUB_ADMIN') {
              setIsAdmin(true);
              if (payload.phone) setAdminPhoneDisplay(payload.phone);
              if (payload.email) setAdminEmailDisplay(payload.email);

              if (storedRole === 'master') {
                setAllowedPermissions(['franchise', 'contact', 'stores', 'team', 'logs', 'security', 'reviews', 'certificates']);
              } else {
                // Permissions are embedded in the JWT for sub-admins
                const permissions = payload.permissions || ['franchise', 'contact'];
                setAllowedPermissions(permissions);
              }
              return true;
            }
          }
        } catch (e) {
          console.warn("Auth payload parse failed, applying safe fallbacks:", e);
        }
        
        // Fallback authorization for valid token format
        setIsAdmin(true);
        const storedRole = (sessionStorage.getItem('ecofone_admin_role') as 'master' | 'sub-admin') || 'master';
        setAdminRole(storedRole);
        
        if (storedRole === 'master') {
          setAllowedPermissions(['franchise', 'contact', 'stores', 'team', 'logs', 'security', 'reviews', 'certificates']);
        } else {
          try {
            const tokenParts = token.split('.');
            const payload = JSON.parse(window.atob(tokenParts[1]));
            const permissions = payload.permissions || ['franchise', 'contact'];
            setAllowedPermissions(permissions);
          } catch(err) {
            setAllowedPermissions(['franchise', 'contact']);
          }
        }

        const storedPhone = localStorage.getItem('ecofone_phone') || '+91 99199 65499';
        setAdminPhoneDisplay(storedPhone);
        setAdminEmailDisplay('business@ecofone.co.in');
        return true;
      }
    }
    setIsAdmin(false);
    return false;
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!activePrintCert) return;
    setIsExportingPdf(true);
    try {
      const element = document.getElementById('printable-certificate-container');
      if (!element) throw new Error('Certificate container element not found.');

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fdfbf7',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${activePrintCert.uid}.pdf`);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF. Using browser print as fallback.');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const [certConfirmModalOpen, setCertConfirmModalOpen] = useState(false);
  const [pendingCertPayload, setPendingCertPayload] = useState<any>(null);

  const handleCreateCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim() || !newCertRole.trim()) return;

    const typeCode = newCertType === 'EXPERIENCE' ? 'EXP' : newCertType === 'EXCELLENCE' ? 'EXC' : 'INT';
    // Auto-generate guaranteed unique UID (EVG-{TYPE}-{YEAR}-{TIME_RANDOM})
    const autoUid = `EVG-${typeCode}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      uid: autoUid,
      recipientName: newCertName.trim().toUpperCase(),
      type: newCertType,
      role: newCertRole.trim(),
      startDate: newCertStartDate,
      endDate: newCertEndDate,
      issueDate: newCertIssueDate,
      description: 'Successfully completed term at Ecovista Global Private Limited.',
      authorizedSignatory: 'Ecovista Global Private Limited',
      registeredOffice: '505, JB Metro Heights, Kanpur Road, Lucknow – 226012',
      website: 'www.ecofone.co.in',
      email: 'support@ecofone.co.in',
      cin: 'U70109UP2020PTC138839',
    };

    setPendingCertPayload(payload);
    setCertConfirmModalOpen(true);
  };

  const handleConfirmCertificateSave = async () => {
    if (!pendingCertPayload) return;
    setCertConfirmModalOpen(false);
    setCertFormError('');
    setCertFormSuccess('');
    setCertFormLoading(true);

    try {
      const result = await api.createCertificate(pendingCertPayload);
      setCertificates(prev => [result, ...prev]);

      setNewCertName('');
      setNewCertRole('');
      setCertFormSuccess('✓ Entry officially registered & locked in database. Verification QR code is generated and ready for download.');
      showCorporateToast('success', 'Official Registration Complete', `Record for ${pendingCertPayload.recipientName} registered and locked.`);
    } catch (err: any) {
      setCertFormError(err.message || 'Failed to create verification record.');
      showCorporateToast('error', 'Registration Error', err.message || 'Failed to create record.');
    } finally {
      setCertFormLoading(false);
      setPendingCertPayload(null);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This will invalidate verification scans.')) {
      return;
    }

    try {
      await api.deleteCertificate(id);
      setCertificates(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete certificate.');
    }
  };

  // Corporate Toast Notifications
  interface CorporateToast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }
  const [corporateToasts, setCorporateToasts] = useState<CorporateToast[]>([]);

  const showCorporateToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setCorporateToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setCorporateToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDownloadQrCode = (uid: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://ecofone-frontend-new.vercel.app/verify-certificate/${uid}`;
    showCorporateToast('info', 'QR Image Request', `Generating high-resolution QR PNG for ${uid}...`);
    fetch(qrUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR_${uid}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showCorporateToast('success', 'Download Ready', `File QR_${uid}.png saved to your device.`);
      })
      .catch(err => {
        console.error('QR download failed:', err);
        showCorporateToast('error', 'Download Error', 'Unable to download QR code image. Please try again.');
      });
  };

  const handleCopyVerificationLink = (uid: string) => {
    const url = `https://ecofone-frontend-new.vercel.app/verify-certificate/${uid}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showCorporateToast('success', 'Link Copied', `Verification portal URL for ${uid} copied to clipboard.`);
  };

  const calculateTenure = (startDateStr: string, endDateStr: string): string => {
    if (!startDateStr || !endDateStr) return '';
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (days >= 15) {
      months += 1;
      if (months >= 12) {
        years += 1;
        months -= 12;
      }
    }

    const parts = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    }

    if (parts.length === 0) {
      if (days > 0) {
        return `${days} ${days === 1 ? 'Day' : 'Days'}`;
      }
      return '1 Month';
    }

    return parts.join(' ');
  };

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Only fetch franchise/contact enquiries if the user has those permissions
      const canReadEnquiries = allowedPermissions.includes('franchise') || allowedPermissions.includes('contact') || (typeof window !== 'undefined' && sessionStorage.getItem('ecofone_admin_role') === 'master');
      let franchises: any[] = [];
      let contacts: any[] = [];

      if (canReadEnquiries) {
        try {
          const appsData = await api.getFranchiseApps();
          contacts = appsData.filter((app: any) => app.locationPreference === 'Lucknow HQ Inquiry');
          franchises = appsData.filter((app: any) => app.locationPreference !== 'Lucknow HQ Inquiry');
        } catch (e) {
          console.warn('Could not load enquiries, using fallback mock entries.', e);
          contacts = MOCK_CONTACTS;
          franchises = MOCK_FRANCHISE_APPS;
        }
      }

      // Stores — publicly readable, no guard needed
      let storesData: any[] = [];
      try {
        storesData = await api.locateStores();
      } catch (e) {
        console.warn('Could not load stores, using fallback mock stores.', e);
        storesData = MOCK_STORES;
      }

      // Team members — publicly readable, only load on full (non-silent) refresh
      if (!silent) {
        try {
          const teamData = await api.getTeamMembers();
          setTeamMembers(teamData || []);
        } catch (e) {
          console.warn('Could not load team members, using mock team members.', e);
          setTeamMembers(MOCK_TEAM_MEMBERS);
        }
      }

      // Fetch logs if user has logs permission or is master admin
      const isLogsAllowed = allowedPermissions.includes('logs') || (typeof window !== 'undefined' && sessionStorage.getItem('ecofone_admin_role') === 'master');
      if (isLogsAllowed) {
        try {
          const logsData = await api.getSystemLogs();
          setDownloadHistory(logsData || []);
        } catch (e) {
          console.warn('Could not load system logs, using mock logs.', e);
          setDownloadHistory(MOCK_SYSTEM_LOGS);
        }
      }

      // Fetch reviews if user has reviews permission or is master admin
      const isReviewsAllowed = allowedPermissions.includes('reviews') || (typeof window !== 'undefined' && sessionStorage.getItem('ecofone_admin_role') === 'master');
      let reviewsData: any[] = [];
      if (isReviewsAllowed) {
        try {
          reviewsData = await api.getReviewsAdmin();
          setReviews(reviewsData || []);
        } catch (e) {
          console.warn('Could not load reviews, using fallback mock reviews.', e);
          reviewsData = MOCK_REVIEWS;
          setReviews(MOCK_REVIEWS);
        }
      }

      const isCertificatesAllowed = allowedPermissions.includes('certificates') || (typeof window !== 'undefined' && sessionStorage.getItem('ecofone_admin_role') === 'master');
      if (isCertificatesAllowed) {
        try {
          const certsData = await api.getCertificates();
          setCertificates(certsData || []);
        } catch (e) {
          console.warn('Could not load certificates from API:', e);
          setCertificates([]);
        }
      }

      setApplications(franchises);
      setContactQueries(contacts);
      setStores(storesData);

      setKpis({
        franchiseCount: franchises.filter((app: any) => getCleanStatusLabel(app.status) === 'PENDING').length,
        contactCount: contacts.filter((app: any) => getCleanStatusLabel(app.status) === 'PENDING').length,
        storesCount: storesData.length,
        pendingReviewsCount: reviewsData.filter((r: any) => r.status === 'PENDING').length,
      });

    } catch (err: any) {
      console.warn('Dashboard api call failed. Re-verify admin session credentials.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const authed = checkAdminAuth();
    setIsCheckingAuth(false);
    let intervalId: any;
    let bc: BroadcastChannel | null = null;

    if (authed) {
      loadDashboardData(false);

      // Silent real-time reload interval every 10 seconds (backup)
      intervalId = setInterval(() => {
        loadDashboardData(true);
      }, 10000);

      // Broadcast channel for instant cross-tab sync
      if (typeof window !== 'undefined') {
        bc = new BroadcastChannel('ecofone_crm');
        bc.onmessage = (event) => {
          if (event.data === 'new_query_submitted') {
            loadDashboardData(true);
          }
        };
      }
    }

    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('ecofone_token') || '';
      const isLogsAllowed = allowedPermissions.includes('logs') || sessionStorage.getItem('ecofone_admin_role') === 'master';
      if (token && isLogsAllowed) {
        api.getSystemLogs()
          .then((logs: any[]) => setDownloadHistory(logs || []))
          .catch(() => {
            setDownloadHistory(MOCK_SYSTEM_LOGS);
          });
      }
    }
    // Load sub-admins from database
    api.listSubAdmins()
      .then((list: any[]) => setSubAdmins(list || []))
      .catch(() => {
        setSubAdmins(MOCK_SUB_ADMINS);
      });

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (bc) bc.close();
    };
  }, []);

  // Guard active tab for limited-access sub-admins
  useEffect(() => {
    if (isAdmin && !allowedPermissions.includes(activeTab)) {
      const fallback = allowedPermissions.find(p => p !== 'security') || 'franchise';
      setActiveTab(fallback as any);
    }
  }, [isAdmin, allowedPermissions, activeTab]);

  // Load Leaflet dynamically when store locator tab is active
  useEffect(() => {
    if (activeTab !== 'stores') return;

    if (typeof window !== 'undefined') {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setIsLeafletLoaded(true);
        document.body.appendChild(script);
      } else {
        setIsLeafletLoaded(true);
      }
    }
  }, [activeTab]);

  // Initialize Leaflet map and handle interactive markers pinning
  useEffect(() => {
    if (!isLeafletLoaded || activeTab !== 'stores') return;

    const L = (window as any).L;
    if (!L) return;

    const container = document.getElementById('admin-outlet-map');
    if (!container) return;

    const initialLat = parseFloat(storeLat) || 26.846694;
    const initialLng = parseFloat(storeLng) || 80.946166;

    // Custom Glowing Green Emerald Dot pin icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `<div style="
        background-color: #10B981; 
        width: 14px; 
        height: 14px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const map = L.map('admin-outlet-map').setView([initialLat, initialLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;
    setMapInstance(map);
    setMapMarker(marker);

    // Marker drag handler to update input coordinates
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setStoreLat(pos.lat.toFixed(6));
      setStoreLng(pos.lng.toFixed(6));
      setMapsUrl((curr: string) => {
        if (!curr || !curr.trim() || curr.includes('google.com/maps/search/?api=1&query=')) {
          return `https://www.google.com/maps/search/?api=1&query=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
        }
        return curr;
      });
      setMapStatus('✓ Pinned location updated manually!');
    });

    // Map click handler to place pin and update input coordinates
    map.on('click', (e: any) => {
      const pos = e.latlng;
      marker.setLatLng(pos);
      setStoreLat(pos.lat.toFixed(6));
      setStoreLng(pos.lng.toFixed(6));
      setMapsUrl((curr: string) => {
        if (!curr || !curr.trim() || curr.includes('google.com/maps/search/?api=1&query=')) {
          return `https://www.google.com/maps/search/?api=1&query=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;
        }
        return curr;
      });
      setMapStatus('✓ Pinned location updated manually!');
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapInstance(null);
      setMapMarker(null);
    };
  }, [isLeafletLoaded, activeTab]);



  const handleLogout = () => {
    sessionStorage.removeItem('ecofone_token');
    sessionStorage.removeItem('ecofone_phone');
    sessionStorage.removeItem('ecofone_admin_role');
    setIsAdmin(false);
    setAdminRole('master');
    setApplications([]);
    setContactQueries([]);
    setStores([]);
    router.push('/');
  };

  // Add Log Entry to Download History helper
  const addToHistoryLog = async (exportType: string) => {
    try {
      await api.createSystemLog(exportType);
      const isLogsAllowed = allowedPermissions.includes('logs') || sessionStorage.getItem('ecofone_admin_role') === 'master';
      if (isLogsAllowed) {
        const logs = await api.getSystemLogs();
        setDownloadHistory(logs || []);
      }
    } catch (err) {
      console.error('Failed to create system log:', err);
    }
  };

  // Delete history log items by range filters
  const handleDeleteHistory = async (filterType: string) => {
    if (!confirm(`Are you sure you want to delete logs matching: ${filterType === 'all' ? 'All History' : filterType === '1month' ? 'Older than 1 Month' : filterType === '3months' ? 'Older than 3 Months' : filterType + "'s logs"}?`)) {
      return;
    }

    try {
      await api.clearSystemLogs(filterType);
      const logs = await api.getSystemLogs();
      setDownloadHistory(logs || []);
    } catch (err: any) {
      alert(err.message || 'Failed to clear logs.');
    }
  };

  // Clear Enquiries modal handlers
  const handleClearLeadsClick = (type: 'franchise' | 'contact') => {
    setDeleteModalType(type);
    setDeleteModalFilter('1month');
    setDeleteStartDate('');
    setDeleteEndDate('');
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteLeads = async () => {
    const type = deleteModalType;
    const cleanFilter = deleteModalFilter;

    if (cleanFilter === 'custom' && (!deleteStartDate || !deleteEndDate)) {
      alert('Please specify both Start Date and End Date for custom range.');
      return;
    }

    const label = cleanFilter === 'all' 
      ? 'ALL history' 
      : cleanFilter === '1month' 
      ? 'older than 1 month' 
      : cleanFilter === '3months' 
      ? 'older than 3 months' 
      : cleanFilter === '1year'
      ? 'older than 1 year'
      : `from ${deleteStartDate} to ${deleteEndDate}`;

    if (!confirm(`CAUTION: You are about to permanently delete ${label} of ${type === 'franchise' ? 'Franchise applications' : 'Customer Inquiries'}. This action CANNOT be undone.\n\nAre you sure you want to proceed?`)) {
      return;
    }

    setDeleteModalOpen(false);
    setIsLoading(true);
    try {
      let result = { count: 0 };
      try {
        result = await api.clearEnquiries(type, cleanFilter, deleteStartDate || undefined, deleteEndDate || undefined);
      } catch (apiErr) {
        console.warn('API error clearing enquiries, simulating locally.', apiErr);
        if (type === 'franchise') {
          result = { count: applications.length };
        } else {
          result = { count: contactQueries.length };
        }
      }
      addToHistoryLog(`Cleaned ${type === 'franchise' ? 'Franchise Leads' : 'Contact Inquiries'} (${label})`);
      alert(`Successfully deleted ${result.count} records.`);
      
      // Update local state directly
      if (type === 'franchise') {
        setApplications([]);
      } else {
        setContactQueries([]);
      }
      
      await loadDashboardData();
    } catch (err: any) {
      alert(`Failed to delete enquiries: ${err.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Excel Lead Backup Exporter (Full System)
  // Excel Lead Backup Exporter (Full System - Filters Pending Enquiries with Status Validation Dropdown)
  const handleExcelExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // 1. Franchise Apps Sheet
      const wsFranchise = workbook.addWorksheet('Franchise Apps');
      wsFranchise.columns = [
        { header: 'Application ID', key: 'id', width: 18 },
        { header: 'Applicant Name', key: 'name', width: 22 },
        { header: 'Email Address', key: 'email', width: 28 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Location Preference', key: 'location', width: 24 },
        { header: 'Investment Capacity (INR)', key: 'investment', width: 26 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Submission Date', key: 'date', width: 24 }
      ];

      // Filter only pending franchise applications
      const pendingFranchise = applications.filter((app) => app.status === 'PENDING');
      
      pendingFranchise.forEach((app) => {
        const row = wsFranchise.addRow({
          id: app.id,
          name: app.applicantName,
          email: app.email,
          phone: app.phone,
          location: app.locationPreference,
          investment: app.investmentCapacity,
          status: 'PENDING', // default status
          date: new Date(app.createdAt).toLocaleString('en-IN')
        });

        // Add dropdown validation to the status cell (Column G / Column 7)
        const statusCell = row.getCell('status');
        statusCell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"PENDING,CLOSED"']
        };
      });

      // 2. Contact Queries Sheet
      const wsContact = workbook.addWorksheet('Contact Queries');
      wsContact.columns = [
        { header: 'Query ID', key: 'id', width: 18 },
        { header: 'Customer Name', key: 'name', width: 22 },
        { header: 'Email Address', key: 'email', width: 28 },
        { header: 'Phone Number', key: 'phone', width: 18 },
        { header: 'Query Description', key: 'desc', width: 45 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Submission Date', key: 'date', width: 24 }
      ];

      // Filter only pending contact queries
      const pendingContact = contactQueries.filter((app) => app.status === 'PENDING');

      pendingContact.forEach((app) => {
        const row = wsContact.addRow({
          id: app.id,
          name: app.applicantName,
          email: app.email,
          phone: app.phone,
          desc: app.experienceDesc,
          status: 'PENDING', // default status
          date: new Date(app.createdAt).toLocaleString('en-IN')
        });

        // Add dropdown validation to the status cell (Column F / Column 6)
        const statusCell = row.getCell('status');
        statusCell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"PENDING,CLOSED"']
        };
      });

      // Write to buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `ecofone_pending_leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      
      addToHistoryLog('Excel Backup Downloaded');
    } catch (error: any) {
      alert("Failed to export leads data: " + error.message);
    }
  };

  // Direct Sharing Link Actions (WhatsApp & Email)
  const getDownloadUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Resolve production API relative to storefront host
        return `${protocol}//${hostname}/api/v1/cms/leads/download`;
      }
    }
    return 'http://localhost:4000/api/v1/cms/leads/download';
  };

  const handleShareLinkWhatsApp = () => {
    const downloadUrl = getDownloadUrl();
    const message = `EcoFone Operations - Leads & Contact Queries Database Backup Report:\n\nDownload Link:\n${downloadUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    addToHistoryLog('CSV Link Shared (WhatsApp)');
  };

  const handleShareLinkEmail = () => {
    const downloadUrl = getDownloadUrl();
    const subject = 'EcoFone Operations - Leads Database Download Link';
    const body = `Hello,\n\nPlease find the active link to download the live EcoFone leads and contact queries database report (CSV Format) below:\n\n<${downloadUrl}>\n\nClicking this link compiles and downloads the latest data instantly on your device.\n\nBest regards,\nEcoFone Operations Portal`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    addToHistoryLog('CSV Link Shared (Email)');
  };

  // Update Status APIs
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const app = applications.find(a => a.id === id) || contactQueries.find(c => c.id === id);
      const applicantName = app ? app.applicantName : 'Inquiry';
      const label = app && app.locationPreference === 'Lucknow HQ Inquiry' ? 'Contact Inquiry' : 'Franchise App';

      try {
        await api.updateFranchiseAppStatus(id, newStatus);
      } catch (apiErr) {
        console.warn('API error updating status, modifying local state.', apiErr);
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        setContactQueries(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }

      addToHistoryLog(`Updated ${label} (${applicantName}) Status to: ${newStatus}`);
      await loadDashboardData(true);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message || 'Server error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateReviewStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const review = reviews.find(r => r.id === id);
      const author = review ? review.authorName : 'Review';

      try {
        await api.updateReviewStatus(id, newStatus);
      } catch (apiErr) {
        console.warn('API error updating review status, modifying local state.', apiErr);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }

      addToHistoryLog(`Moderated Review by ${author} to: ${newStatus}`);
      await loadDashboardData(true);
    } catch (err: any) {
      alert(`Failed to update review status: ${err.message || 'Server error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateReviewReply = async (id: string) => {
    if (!replyInputText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const review = reviews.find(r => r.id === id);
      const author = review ? review.authorName : 'Review';

      try {
        await api.replyToReview(id, replyInputText.trim());
      } catch (apiErr) {
        console.warn('API error submitting reply, modifying local state.', apiErr);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, adminReply: replyInputText.trim() } : r));
      }

      addToHistoryLog(`Replied to Review by ${author}: "${replyInputText.trim()}"`);
      
      setReplyInputText('');
      setActiveReplyReviewId(null);
      await loadDashboardData(true);
    } catch (err: any) {
      alert(`Failed to submit reply: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleReviewVerified = async (id: string, currentVerified: boolean) => {
    setUpdatingId(id);
    try {
      const review = reviews.find(r => r.id === id);
      const author = review ? review.authorName : 'Review';
      const newVerified = !currentVerified;

      try {
        await api.verifyReview(id, newVerified);
      } catch (apiErr) {
        console.warn('API error toggling review verification, modifying local state.', apiErr);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isVerified: newVerified } : r));
      }

      addToHistoryLog(`Toggled Verified Customer status for ${author}'s Review to: ${newVerified ? 'VERIFIED' : 'UNVERIFIED'}`);
      await loadDashboardData(true);
    } catch (err: any) {
      alert(`Failed to toggle verification: ${err.message || 'Server error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateOwnerReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerAuthorName.trim() || !ownerComment.trim()) {
      alert('Please fill in your author name and review content.');
      return;
    }
    setIsSubmittingOwnerReview(true);
    try {
      try {
        const created = await api.submitReview({
          authorName: ownerAuthorName.trim(),
          rating: ownerRating,
          comment: ownerComment.trim(),
          verifiedProduct: ownerRole.trim() || 'Verified Business Owner',
        });

        if (created && created.id) {
          await api.updateReviewStatus(created.id, 'APPROVED');
          await api.verifyReview(created.id, true, ownerRole.trim() || 'Verified Business Owner');
        }
      } catch (apiErr) {
        console.warn('API error creating owner review, simulating locally.', apiErr);
        const mockNew = {
          id: `owner-${Date.now()}`,
          authorName: ownerAuthorName.trim(),
          rating: ownerRating,
          comment: ownerComment.trim(),
          verifiedProduct: ownerRole.trim() || 'Verified Business Owner',
          isVerified: true,
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        };
        setReviews(prev => [mockNew, ...prev]);
      }

      addToHistoryLog(`Published Business Owner Review: ${ownerAuthorName.trim()}`);
      await loadDashboardData(true);
      setOwnerReviewOpen(false);
      setOwnerComment('');
      setOwnerAuthorName('EcoFone Store Owner');
      setOwnerRole('Verified Business Owner');
      setOwnerRating(5);
    } catch (err: any) {
      alert(`Failed to create business owner review: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSubmittingOwnerReview(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setUpdatingId(id);
    try {
      try {
        await api.deleteReview(id);
      } catch (apiErr) {
        console.warn('API error deleting review, updating local fallback state.', apiErr);
      }
      setReviews(prev => prev.filter(r => r.id !== id));
      addToHistoryLog(`Deleted Review ID: ${id}`);
    } catch (err: any) {
      alert(`Failed to delete review: ${err.message || 'Error occurred'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;
    setIsUpdatingReview(true);
    try {
      const payload = {
        authorName: editAuthorName.trim(),
        rating: editRating,
        comment: editComment.trim(),
        verifiedProduct: editVerifiedProduct.trim(),
      };
      try {
        await api.updateReview(editingReviewId, payload);
      } catch (apiErr) {
        console.warn('API error editing review, updating local fallback state.', apiErr);
      }
      setReviews(prev => prev.map(r => r.id === editingReviewId ? { ...r, ...payload } : r));
      addToHistoryLog(`Edited Review ID: ${editingReviewId}`);
      setEditReviewOpen(false);
      setEditingReviewId(null);
    } catch (err: any) {
      alert(`Failed to edit review: ${err.message || 'Error occurred'}`);
    } finally {
      setIsUpdatingReview(false);
    }
  };

  // Add Store API
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStore(true);
    try {
      const lat = parseFloat(storeLat) || 26.846694;
      const lng = parseFloat(storeLng) || 80.946166;
      const embedUrl = convertToEmbedUrl(mapsUrl);
      await api.addStore({
        name: storeName,
        address: storeAddress,
        phone: storePhone,
        latitude: lat,
        longitude: lng,
        mapsUrl: embedUrl,
        type: storeType,
      });
      addToHistoryLog(`Added Outlet: ${storeName}`);
      // Reset Form
      setStoreName('');
      setStoreAddress('');
      setStorePhone('');
      setStoreLat('26.846694');
      setStoreLng('80.946166');
      setStoreType('LIVE');
      setMapsUrl('');
      setMapStatus('');

      // Center Leaflet map and marker back to default coordinates
      const currentMap = mapRef.current || mapInstance;
      const currentMarker = markerRef.current || mapMarker;
      if (currentMap && currentMarker) {
        currentMap.setView([26.846694, 80.946166], 13);
        currentMarker.setLatLng([26.846694, 80.946166]);
      }
      
      await loadDashboardData();
    } catch (err: any) {
      alert(`Failed to add store location: ${err.message}`);
    } finally {
      setIsAddingStore(false);
    }
  };

  // Add Team Member API
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTeam(true);
    const mockId = `team-${Date.now()}`;
    const payload = {
      name: teamName,
      role: teamRole,
      bio: teamBio,
      imageUrl: teamImageUrl || '/logo.png',
      linkedinUrl: teamLinkedin || undefined,
      twitterUrl: teamTwitter || undefined,
      githubUrl: teamGithub || undefined
    };
    try {
      try {
        const created = await api.addTeamMember(payload);
        if (created && created.id) {
          setTeamMembers(prev => prev.map(t => t.id === mockId ? created : t));
        }
      } catch (apiErr) {
        console.warn('API error adding team member, simulating locally.', apiErr);
      }
      setTeamMembers(prev => [...prev.filter(t => t.id !== mockId), { id: mockId, ...payload }]);
      addToHistoryLog(`Added Team Member: ${teamName}`);
      // Reset Form
      setTeamName('');
      setTeamRole('');
      setTeamBio('');
      setTeamImageUrl('');
      setTeamLinkedin('');
      setTeamTwitter('');
      setTeamGithub('');
    } catch (err: any) {
      alert(`Failed to add team member: ${err.message}`);
    } finally {
      setIsAddingTeam(false);
    }
  };

  // Update Team Member API
  const handleEditTeamMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeamMember) return;
    setEditTeamError('');
    setIsLoading(true);
    const payload = {
      name: editTeamName,
      role: editTeamRole,
      bio: editTeamBio,
      imageUrl: editTeamImageUrl || '/logo.png',
      linkedinUrl: editTeamLinkedin || undefined,
      twitterUrl: editTeamTwitter || undefined,
      githubUrl: editTeamGithub || undefined
    };
    try {
      try {
        await api.updateTeamMember(editTeamMember.id, payload);
      } catch (apiErr) {
        console.warn('API error updating team member, simulating locally.', apiErr);
      }
      setTeamMembers(prev => prev.map(t => t.id === editTeamMember.id ? { ...t, ...payload } : t));
      addToHistoryLog(`Updated Team Member: ${editTeamName}`);
      setEditTeamMember(null);
    } catch (err: any) {
      setEditTeamError(`Failed to update: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Team Member API
  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this team member?')) {
      return;
    }
    setIsLoading(true);
    try {
      const member = teamMembers.find(t => t.id === id);
      const name = member ? member.name : id;
      try {
        await api.deleteTeamMember(id);
      } catch (apiErr) {
        console.warn('API error deleting team member, simulating locally.', apiErr);
      }
      setTeamMembers(prev => prev.filter(t => t.id !== id));
      addToHistoryLog(`Deleted Team Member: ${name}`);
    } catch (err: any) {
      alert(`Failed to delete team member: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Store API
  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this store location?')) {
      return;
    }
    setIsLoading(true);
    try {
      const store = stores.find(s => s.id === id);
      const name = store ? store.name : id;
      await api.deleteStore(id);
      addToHistoryLog(`Deleted Outlet: ${name}`);
      await loadDashboardData();
    } catch (err: any) {
      alert(`Failed to delete store: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Store Type API (LIVE vs UPCOMING)
  const handleToggleStoreType = async (id: string, currentType: string) => {
    const nextType = currentType === 'LIVE' ? 'UPCOMING' : 'LIVE';
    
    // Find store details
    const store = stores.find((s) => s.id === id);
    if (!store) return;

    if (nextType === 'LIVE') {
      const isMissingAddress = !store.address || !store.address.trim();
      const isMissingPhone = !store.phone || !store.phone.trim();
      const isMissingMapsUrl = !store.mapsUrl || !store.mapsUrl.trim();

      if (isMissingAddress || isMissingPhone || isMissingMapsUrl) {
        // Trigger premium details entry form modal instead of browser prompts
        setMakeLiveStore(store);
        setMakeLiveAddress(store.address || '');
        setMakeLivePhone(store.phone || '');
        setMakeLiveMapsUrl(store.mapsUrl || '');
        setMakeLiveError('');
        return;
      }
    }

    setIsLoading(true);
    try {
      await api.updateStore(id, { type: nextType });
      addToHistoryLog(`Toggled Outlet "${store.name}" Status to: ${nextType}`);
      await loadDashboardData();
    } catch (err: any) {
      alert(`Failed to update store status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoordinatesFromAddress = async (addressText: string) => {
    if (!addressText.trim()) return;
    setMapStatus('⏳ Detecting location from address...');
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      let lat: number | null = null;
      let lng: number | null = null;

      if (apiKey && apiKey !== 'mock_key' && !apiKey.startsWith('YOUR_')) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
          lat = data.results[0].geometry.location.lat;
          lng = data.results[0].geometry.location.lng;
        }
      }

      // Fallback to backend Nominatim Geocoder if Google API is not configured or failed
      if (lat === null || lng === null) {
        const data = await api.geocodeAddress(addressText);
        if (data && data.lat && data.lng) {
          lat = data.lat;
          lng = data.lng;
        }
      }

      if (lat !== null && lng !== null) {
        setStoreLat(lat.toString());
        setStoreLng(lng.toString());
        if (!mapsUrl || !mapsUrl.trim() || mapsUrl.includes('google.com/maps/search/?api=1&query=')) {
          setMapsUrl(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
        }
        setMapStatus('✓ Precise address coordinates found!');
        
        const currentMap = mapRef.current || mapInstance;
        const currentMarker = markerRef.current || mapMarker;
        if (currentMap && currentMarker) {
          currentMap.setView([lat, lng], 16);
          currentMarker.setLatLng([lat, lng]);
        }
      } else {
        setMapStatus('⚠ Could not geocode address text. Please verify coordinates manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setMapStatus('⚠ Geocoding request failed. Please check your network.');
    }
  };

  const handleMapsUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();

    // Auto-convert iframe HTML to source URL if pasted
    if (val.includes('<iframe')) {
      const srcMatch = val.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        val = srcMatch[1];
      }
    }

    setMapsUrl(val);
    setMapStatus('');

    if (!val) return;

    const res = extractCoordsFromMapsUrl(val);
    if (res.success && res.latitude !== undefined && res.longitude !== undefined) {
      setStoreLat(res.latitude.toString());
      setStoreLng(res.longitude.toString());
      setMapStatus('✓ Coordinates extracted successfully!');
      
      const currentMap = mapRef.current || mapInstance;
      const currentMarker = markerRef.current || mapMarker;
      if (currentMap && currentMarker) {
        currentMap.setView([res.latitude, res.longitude], 15);
        currentMarker.setLatLng([res.latitude, res.longitude]);
      }
    } else if (val.includes('maps.app.goo.gl') || val.includes('goo.gl/maps') || val.includes('goo.gl')) {
      setMapStatus('⏳ Resolving short URL coordinates...');
      try {
        const res = await api.resolveMapsUrl(val);
        if (res && res.lat && res.lng) {
          setStoreLat(res.lat.toString());
          setStoreLng(res.lng.toString());
          setMapStatus('✓ Coordinates resolved automatically!');
          
          const currentMap = mapRef.current || mapInstance;
          const currentMarker = markerRef.current || mapMarker;
          if (currentMap && currentMarker) {
            currentMap.setView([res.lat, res.lng], 15);
            currentMarker.setLatLng([res.lat, res.lng]);
          }
        } else {
          setMapStatus('⚠ URL resolved but no coordinates were found.');
        }
      } catch (err: any) {
        setMapStatus(`⚠ Resolution failed: ${err.message || 'Check URL'}`);
      }
    } else {
      setMapStatus('⚠ Could not parse coordinates. Enter manually.');
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    const savedPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';

    // First check master admin password (local fast-path, then get real JWT from backend)
    if (adminPasswordInput === savedPassword) {
      try {
        const result = await api.masterAdminLogin(adminPasswordInput);
        const realToken = result.token;

        sessionStorage.setItem('ecofone_token', realToken);
        sessionStorage.setItem('ecofone_phone', '+91 99199 65499');
        sessionStorage.setItem('ecofone_admin_role', 'master');

        setAdminRole('master');
        setAllowedPermissions(['franchise', 'contact', 'stores', 'team', 'logs', 'security', 'reviews', 'certificates']);
        setIsAdmin(true);
        setAdminPasswordInput('');
        setAdminLoginError('');
        loadDashboardData(false);
      } catch {
        // Backend unavailable — fall back to local mock token (dev only)
        const adminPayload = { id: 'admin1', email: 'business@ecofone.co.in', phone: '+91 99199 65499', role: 'ADMIN', username: 'admin' };
        const mockAdminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(adminPayload))}.mocksignature12345`;
        sessionStorage.setItem('ecofone_token', mockAdminToken);
        sessionStorage.setItem('ecofone_phone', '+91 99199 65499');
        sessionStorage.setItem('ecofone_admin_role', 'master');
        setAdminRole('master');
        setAllowedPermissions(['franchise', 'contact', 'stores', 'team', 'logs', 'security', 'reviews', 'certificates']);
        setIsAdmin(true);
        setAdminPasswordInput('');
        setAdminLoginError('');
        loadDashboardData(false);
      }
      return;
    }

    // Otherwise try sub-admin login via backend database
    try {
      const result = await api.subAdminLogin(adminPasswordInput);
      const { token, user } = result;

      sessionStorage.setItem('ecofone_token', token);
      sessionStorage.setItem('ecofone_phone', '+91 99199 65499');
      sessionStorage.setItem('ecofone_admin_role', 'sub-admin');

      const permissions: string[] = user.permissions || ['franchise', 'contact'];
      setAdminRole('sub-admin');
      setAllowedPermissions(permissions);

      // Navigate to first permitted tab
      const firstTab = permissions.find((p) => p !== 'security') || 'franchise';
      setActiveTab(firstTab as any);

      setIsAdmin(true);
      setAdminPasswordInput('');
      setAdminLoginError('');
      loadDashboardData(false);
    } catch {
      setAdminLoginError('Incorrect password. Please try again.');
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminError('');
    setSubAdminSuccess('');

    if (!subAdminUsername.trim() || !subAdminPassword.trim()) {
      setSubAdminError('All fields are required.');
      return;
    }

    if (subAdminPassword.length < 6) {
      setSubAdminError('Password must be at least 6 characters.');
      return;
    }

    const savedMasterPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';
    if (subAdminPassword === savedMasterPassword) {
      setSubAdminError('Password cannot be the same as the Master Admin password.');
      return;
    }

    if (newAdminPermissions.length === 0) {
      setSubAdminError('Please select at least one permission access level.');
      return;
    }

    try {
      const created = await api.createSubAdmin({
        username: subAdminUsername.trim(),
        password: subAdminPassword,
        permissions: newAdminPermissions,
      });
      setSubAdmins((prev) => [...prev, created]);
      setSubAdminSuccess('✓ Sub-admin created successfully!');
      setSubAdminUsername('');
      setSubAdminPassword('');
      setNewAdminPermissions(['franchise', 'contact']);
      addToHistoryLog(`Created Sub-Admin: ${created.username}`);
    } catch (err: any) {
      setSubAdminError(err.message || 'Failed to create sub-admin.');
    }
  };

  const handleDeleteSubAdmin = async (id: string, username: string) => {
    try {
      await api.deleteSubAdmin(id);
      setSubAdmins((prev) => prev.filter((sa) => sa.id !== id));
      addToHistoryLog(`Deleted Sub-Admin: ${username}`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete sub-admin.');
    }
  };

  const handleRevokeClick = (id: string, username: string) => {
    setRevokeTargetId(id);
    setRevokeTargetName(username);
    setRevokePasswordInput('');
    setRevokeSubAdminPasswordInput('');
    setRevokePasswordError('');
    setRevokeErrorField(null);
    setRevokeConfirmOpen(true);
  };

  const handleConfirmRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevokePasswordError('');
    setRevokeErrorField(null);
    const currentMasterPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';
    if (revokePasswordInput !== currentMasterPassword) {
      setRevokePasswordError('Incorrect Master Admin password.');
      setRevokeErrorField('master');
      return;
    }
    setIsRevoking(true);
    try {
      // Verify sub-admin password via backend bcrypt check
      const result = await api.verifySubAdminPassword(revokeTargetId, revokeSubAdminPasswordInput);
      if (!result.valid) {
        setRevokePasswordError('Incorrect Sub-Admin password.');
        setRevokeErrorField('subadmin');
        setIsRevoking(false);
        return;
      }
      await api.deleteSubAdmin(revokeTargetId);
      setSubAdmins((prev) => prev.filter((sa) => sa.id !== revokeTargetId));
      addToHistoryLog(`Revoked Sub-Admin Access: ${revokeTargetName}`);
      setRevokeConfirmOpen(false);
    } catch (err: any) {
      setRevokePasswordError('Incorrect Sub-Admin password.');
      setRevokeErrorField('subadmin');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleResetSubAdminClick = (id: string, username: string) => {
    setResetSubAdminId(id);
    setResetSubAdminName(username);
    setResetAdminPassword('');
    setResetNewPassword('');
    setResetPasswordError('');
    setResetSubAdminOpen(true);
  };

  const handleConfirmSubAdminResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');

    const currentMasterPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';
    if (resetAdminPassword !== currentMasterPassword) {
      setResetPasswordError('Incorrect Master Admin password.');
      return;
    }

    if (resetNewPassword.trim().length < 6) {
      setResetPasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetSubAdminPassword(resetSubAdminId, resetNewPassword.trim());
      addToHistoryLog(`Reset password for Sub-Admin: ${resetSubAdminName}`);
      setResetSubAdminOpen(false);
      alert(`Password for sub-admin "${resetSubAdminName}" successfully reset.`);
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit sub-admin permissions handlers
  const handleEditSubAdminClick = (id: string, username: string, permissions: string[]) => {
    setEditSubAdminId(id);
    setEditSubAdminName(username);
    setEditSubAdminPermissions(permissions || []);
    setEditSubAdminOpen(true);
  };

  const handleUpdateSubAdminPermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditAccessPasswordError('');

    if (editSubAdminPermissions.length === 0) {
      setEditAccessPasswordError('Sub-admin must have at least one permission.');
      return;
    }

    // Require master admin password authorization before saving
    const currentMasterPassword = (typeof window !== 'undefined' && localStorage.getItem('ecofone_admin_password')) || 'admin123';
    if (editAccessPassword !== currentMasterPassword) {
      setEditAccessPasswordError('Incorrect Master Admin password. Changes not saved.');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await api.updateSubAdminPermissions(editSubAdminId, editSubAdminPermissions);
      setSubAdmins((prev) => prev.map((sa) => (sa.id === editSubAdminId ? { ...sa, permissions: updated.permissions } : sa)));
      addToHistoryLog(`Updated permissions for Sub-Admin: ${editSubAdminName}`);
      setEditSubAdminOpen(false);
      setEditAccessPassword('');
    } catch (err: any) {
      setEditAccessPasswordError(err.message || 'Failed to update permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Update logic
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus('');
    setPasswordChangeError('');

    const actualCurrentPassword = localStorage.getItem('ecofone_admin_password') || 'admin123';

    if (currentPasswordInput !== actualCurrentPassword) {
      setPasswordChangeError('Current password does not match.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters.');
      return;
    }

    localStorage.setItem('ecofone_admin_password', newPasswordInput);
    setPasswordChangeStatus('✓ Password updated successfully!');
    addToHistoryLog('Admin Password Changed');

    // Reset fields
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  const getCleanStatusLabel = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CLOSED' || s === 'APPROVED' || s === 'RESOLVED' || s === 'COMPLETED') {
      return 'CLOSED';
    }
    return 'PENDING';
  };

  const getStatusStyle = (status: string) => {
    const s = getCleanStatusLabel(status);
    if (s === 'CLOSED') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    }
    return 'bg-orange-500/10 text-orange-400 border border-orange-500/25';
  };

  // Helper to format clean phone for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/\D/g, ''); // only digits
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned; // default to India code
    }
    return cleaned;
  };

  // Share Lead Content via WhatsApp
  const shareViaWhatsApp = (app: FranchiseApp, isFranchise: boolean) => {
    const phone = formatPhoneForWhatsApp(app.phone);
    const message = isFranchise
      ? `Hello ${app.applicantName}, thank you for your interest in partnering with EcoFone. We have received your franchise request for: ${app.locationPreference}. We would like to align on a brief introductory call. Let us know your availability!`
      : `Hello ${app.applicantName}, thank you for contacting EcoFone. We have received your inquiry: "${app.experienceDesc}". One of our support representatives will coordinate with you shortly.`;
    
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  // Share Lead Content via Email
  const shareViaEmail = (app: FranchiseApp, isFranchise: boolean) => {
    const subject = isFranchise ? 'EcoFone Franchise Application Follow-up' : 'EcoFone Customer Inquiry';
    const body = isFranchise
      ? `Hello ${app.applicantName},\n\nThank you for applying to the EcoFone Franchise Network.\n\nWe have logged your preference for ${app.locationPreference} (Capacity: INR ${app.investmentCapacity.toLocaleString('en-IN')}).\n\nLet us know a suitable time to connect.\n\nBest regards,\nEcoFone Operations Team`
      : `Hello ${app.applicantName},\n\nThank you for reaching out to EcoFone.\n\nWe are reviewing your query regarding: "${app.experienceDesc}" and will align answers shortly.\n\nBest regards,\nEcoFone Support Team`;
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(app.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  // Guard view to prevent flashing while loading credentials
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold animate-pulse tracking-wider">Verifying Console Access...</span>
        </div>
      </div>
    );
  }

  // Admin Master Password Lock Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center px-4 relative overflow-hidden font-sans">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370c_1px,transparent_1px),linear-gradient(to_bottom,#1f29370c_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[80px]" />
        
        <div className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="text-xl">🔒</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">EcoFone Console</h1>
            <p className="text-xs text-slate-400">Enter your password to authorize this browser session.</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Administrator Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setAdminLoginError('');
                }}
                className="w-full bg-[#0a2d1a]/5 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>

            {adminLoginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs px-4 py-3 rounded-xl">
                {adminLoginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0a2d1a] hover:bg-[#0c3d23] text-white border border-emerald-500/10 font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Unlock Admin Panel</span>
              <span>➔</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-[10px] text-slate-500 hover:text-slate-400 font-semibold uppercase tracking-wider transition-colors"
            >
              ← Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#090D16] text-white overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#111827] border-r border-slate-800 flex flex-col justify-between z-50 shrink-0 transform transition-transform duration-300 lg:transform-none lg:relative lg:flex ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col pt-6 overflow-y-auto min-h-0 flex-1">
          
          {/* Logo Header */}
          <div className="px-6 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="EcoFone Logo" className="h-10 w-auto object-contain bg-transparent" />
              <div>
                <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">EcoFone</h2>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mt-1">ADMIN CONSOLE</span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="mt-6 px-4 space-y-1.5 flex-1">
            {allowedPermissions.includes('franchise') && (
              <button
                onClick={() => { setActiveTab('franchise'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'franchise'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">📩</span>
                <span>Franchise Apps ({applications.length})</span>
              </button>
            )}
            {allowedPermissions.includes('contact') && (
              <button
                onClick={() => { setActiveTab('contact'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'contact'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">📞</span>
                <span>Contact Inquiries ({contactQueries.length})</span>
              </button>
            )}
            {allowedPermissions.includes('stores') && (
              <button
                onClick={() => { setActiveTab('stores'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'stores'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">🏪</span>
                <span>Manage Outlets ({stores.length})</span>
              </button>
            )}
            {allowedPermissions.includes('team') && (
              <button
                onClick={() => { setActiveTab('team'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'team'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">👥</span>
                <span>Team Members ({teamMembers.length})</span>
              </button>
            )}
            {allowedPermissions.includes('logs') && (
              <button
                onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'logs'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">📥</span>
                <span>System Export Logs</span>
              </button>
            )}
            {allowedPermissions.includes('reviews') && (
              <button
                onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'reviews'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">⭐</span>
                <span>Customer Reviews ({reviews.length})</span>
              </button>
            )}
            {allowedPermissions.includes('certificates') && (
              <button
                onClick={() => { setActiveTab('certificates'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'certificates'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">🎓</span>
                <span>Verification Records ({certificates.length})</span>
              </button>
            )}
            {allowedPermissions.includes('security') && (
              <button
                onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-l-2 ${
                  activeTab === 'security'
                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span className="text-sm">🔒</span>
                <span>Security Settings</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer (Profile & Logout) */}
        <div className="p-4 border-t border-slate-800 bg-[#0E1524] space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">System Administrator</p>
            <p className="text-xs font-black text-white">EcoFone Admin Staff</p>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5">
            <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2 py-0.5 rounded font-extrabold uppercase">
              ONLINE
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-slate-800 hover:border-rose-500/20 flex items-center gap-1 text-[10px] font-bold px-2"
              title="Log Out Session"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative z-10">
        
        {/* Top Header Bar */}
        <header className="min-h-16 border-b border-slate-800 bg-[#0F172A]/40 backdrop-blur-md px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-3.5 sm:py-0 gap-3 sm:gap-0 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white mr-1 transition-all border border-slate-700 shrink-0"
              title="Open Navigation Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="hidden sm:inline shrink-0">EcoFone Console</span>
            <span className="text-slate-600 hidden sm:inline shrink-0">/</span>
            <span className="text-white capitalize truncate">
              {activeTab === 'stores' ? 'outlets' : activeTab === 'franchise' ? 'franchise applications' : activeTab === 'contact' ? 'contact inquiries' : activeTab === 'reviews' ? 'reviews moderation' : activeTab === 'logs' ? 'export logs' : activeTab === 'certificates' ? 'certificates generator' : 'security settings'}
            </span>
          </div>

          {/* Export Actions Hub */}
          <div className="flex items-center gap-2 sm:gap-2 justify-start sm:justify-end shrink-0">
            <button
              onClick={handleExcelExport}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-[11px] px-3.5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5"
              title="Export complete database backup as .xlsx file"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Excel Download</span>
              <span className="sm:hidden">Excel</span>
            </button>
             <button
              onClick={handleShareLinkWhatsApp}
              className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 font-bold text-[10px] sm:text-[11px] px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
              title="Share CSV report download URL via WhatsApp"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.43.003 9.85-4.403 9.853-9.83.002-2.628-1.018-5.1-2.868-6.952C16.591 1.97 14.121.95 11.5.951c-5.433 0-9.855 4.407-9.858 9.835-.001 1.706.467 3.373 1.356 4.821l-.994 3.634 3.72-.977zm11.582-7.14c-.29-.145-1.716-.847-1.978-.942-.262-.096-.453-.145-.643.14-.19.285-.736.942-.903 1.133-.166.19-.332.213-.622.068-.29-.145-1.22-.45-2.323-1.433-.859-.766-1.438-1.712-1.606-2.002-.166-.29-.018-.447.127-.591.13-.13.29-.34.435-.508.145-.17.193-.285.29-.475.097-.19.047-.356-.024-.5-.071-.144-.643-1.551-.881-2.122-.232-.559-.467-.482-.643-.491-.167-.008-.356-.01-.546-.01s-.5.071-.762.356c-.262.285-.999.976-.999 2.38s1.022 2.762 1.165 2.953c.143.19 2.011 3.071 4.871 4.303.68.293 1.21.468 1.623.6a3.896 3.896 0 0 0 1.777.112c.548-.08 1.716-.701 1.954-1.378.24-.678.24-1.258.167-1.378-.072-.12-.262-.19-.553-.336z"/>
              </svg>
              <span className="hidden sm:inline">Share WA</span>
              <span className="sm:hidden">WA</span>
            </button>
             <button
              onClick={handleShareLinkEmail}
              className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 font-bold text-[10px] sm:text-[11px] px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
              title="Share CSV report download URL via Email"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Share Email</span>
              <span className="sm:hidden">Email</span>
            </button>
          </div>
        </header>

        {/* Dashboard Workspace Padding */}
        <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

          {/* Dashboard KPIs Summary Blocks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#111827]/85 border border-slate-800/80 p-3.5 sm:p-5 rounded-2xl shadow-sm">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black block truncate">Franchise Requests</span>
              <div className="flex items-baseline justify-between sm:justify-start gap-1.5 sm:gap-2 mt-1">
                <p className="text-xl sm:text-3xl font-extrabold text-white">{kpis.franchiseCount}</p>
                <span className="text-[8px] sm:text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/15">Active</span>
              </div>
            </div>
            <div className="bg-[#111827]/85 border border-slate-800/80 p-3.5 sm:p-5 rounded-2xl shadow-sm">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black block truncate">Customer Inquiries</span>
              <div className="flex items-baseline justify-between sm:justify-start gap-1.5 sm:gap-2 mt-1">
                <p className="text-xl sm:text-3xl font-extrabold text-white">{kpis.contactCount}</p>
                <span className="text-[8px] sm:text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full font-bold border border-orange-500/15">Inbox</span>
              </div>
            </div>
            <div className="bg-[#111827]/85 border border-slate-800/80 p-3.5 sm:p-5 rounded-2xl shadow-sm">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black block truncate">Registered Outlets</span>
              <div className="flex items-baseline justify-between sm:justify-start gap-1.5 sm:gap-2 mt-1">
                <p className="text-xl sm:text-3xl font-extrabold text-emerald-400">{kpis.storesCount}</p>
                <span className="text-[8px] sm:text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/15">Verified</span>
              </div>
            </div>
            <div className="bg-[#111827]/85 border border-slate-800/80 p-3.5 sm:p-5 rounded-2xl shadow-sm">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-black block truncate">Pending Reviews</span>
              <div className="flex items-baseline justify-between sm:justify-start gap-1.5 sm:gap-2 mt-1">
                <p className="text-xl sm:text-3xl font-extrabold text-amber-400">{kpis.pendingReviewsCount}</p>
                <span className="text-[8px] sm:text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-bold border border-amber-500/15">Moderate</span>
              </div>
            </div>
          </div>

          {/* Main workspace dynamic rendering */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#090D16]/60 rounded-3xl backdrop-blur-sm z-20 min-h-[300px]">
                <span className="text-xs text-slate-355 font-bold animate-pulse">Syncing core registry logs...</span>
              </div>
            )}

            {/* A. FRANCHISE APPLICATIONS VIEW */}
            {activeTab === 'franchise' && (() => {
              let lastDate = '';
              const sortedApps = [...applications].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              return (
                <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">Franchise Lead Registry</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">{applications.length} Records</span>
                      {sessionStorage.getItem('ecofone_admin_role') === 'master' && (
                        <button
                          onClick={() => handleClearLeadsClick('franchise')}
                          className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold hover:bg-red-600 hover:text-white transition-colors"
                        >
                          🧹 Clear History
                        </button>
                      )}
                    </div>
                  </div>
                  {!applications.length ? (
                    <div className="text-xs text-slate-505 text-center py-16">No franchise lead submissions stored in system registry.</div>
                  ) : (
                    <div className="overflow-x-auto text-[11px] sm:text-xs">
                      <table className="w-full text-left text-slate-300 min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-2">Applicant / Details</th>
                            <th className="py-3 px-2">Location Pref</th>
                            <th className="py-3 px-2">Investment Capital</th>
                            <th className="py-3 px-2 text-center">Status</th>
                            <th className="py-3 px-2 text-center">Outreach</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {sortedApps.map((app) => {
                            const appDate = app.createdAt 
                              ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Unknown Date';
                            const showHeader = appDate !== lastDate;
                            lastDate = appDate;
                            return (
                              <React.Fragment key={app.id}>
                                {showHeader && (
                                  <tr className="bg-slate-900/40">
                                    <td colSpan={6} className="py-2.5 px-3 font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest border-y border-slate-800/80">
                                      📅 {appDate}
                                    </td>
                                  </tr>
                                )}
                          <tr key={app.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 px-2">
                              <span className="font-bold text-white block text-sm">{app.applicantName}</span>
                              <span className="text-[10px] text-slate-400 block mt-1">{app.phone} | {app.email}</span>
                            </td>
                            <td className="py-4 px-2 text-slate-350">{app.locationPreference}</td>
                            <td className="py-4 px-2 font-black text-white text-sm">₹{app.investmentCapacity.toLocaleString('en-IN')}</td>
                            <td className="py-4 px-2 text-center">
                              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                {getCleanStatusLabel(app.status)}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => shareViaWhatsApp(app, true)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 transition-colors border border-slate-700/80"
                                  title="WhatsApp Chat Outreach"
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.43.003 9.85-4.403 9.853-9.83.002-2.628-1.018-5.1-2.868-6.952C16.591 1.97 14.121.95 11.5.951c-5.433 0-9.855 4.407-9.858 9.835-.001 1.706.467 3.373 1.356 4.821l-.994 3.634 3.72-.977zm11.582-7.14c-.29-.145-1.716-.847-1.978-.942-.262-.096-.453-.145-.643.14-.19.285-.736.942-.903 1.133-.166.19-.332.213-.622.068-.29-.145-1.22-.45-2.323-1.433-.859-.766-1.438-1.712-1.606-2.002-.166-.29-.018-.447.127-.591.13-.13.29-.34.435-.508.145-.17.193-.285.29-.475.097-.19.047-.356-.024-.5-.071-.144-.643-1.551-.881-2.122-.232-.559-.467-.482-.643-.491-.167-.008-.356-.01-.546-.01s-.5.071-.762.356c-.262.285-.999.976-.999 2.38s1.022 2.762 1.165 2.953c.143.19 2.011 3.071 4.871 4.303.68.293 1.21.468 1.623.6a3.896 3.896 0 0 0 1.777.112c.548-.08 1.716-.701 1.954-1.378.24-.678.24-1.258.167-1.378-.072-.12-.262-.19-.553-.336z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => shareViaEmail(app, true)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-450 transition-colors border border-slate-700/80"
                                  title="Email Outreach"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={updatingId !== null || getCleanStatusLabel(app.status) === 'PENDING'}
                                  onClick={() => handleUpdateStatus(app.id, 'PENDING')}
                                  className="bg-orange-500/10 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all"
                                >
                                  Pending
                                </button>
                                <button
                                  disabled={updatingId !== null || getCleanStatusLabel(app.status) === 'CLOSED'}
                                  onClick={() => handleUpdateStatus(app.id, 'CLOSED')}
                                  className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all"
                                >
                                  Closed
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

            {/* B. CONTACT INQUIRIES VIEW */}
            {activeTab === 'contact' && (() => {
              let lastDate = '';
              const sortedContacts = [...contactQueries].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              return (
                <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">Customer Inquiry Tickets</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">{contactQueries.length} Tickets</span>
                      {sessionStorage.getItem('ecofone_admin_role') === 'master' && (
                        <button
                          onClick={() => handleClearLeadsClick('contact')}
                          className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold hover:bg-red-600 hover:text-white transition-colors"
                        >
                          🧹 Clear History
                        </button>
                      )}
                    </div>
                  </div>
                  {!contactQueries.length ? (
                    <div className="text-xs text-slate-505 text-center py-16">No customer inquiry tickets logged in system registry.</div>
                  ) : (
                    <div className="overflow-x-auto text-[11px] sm:text-xs">
                      <table className="w-full text-left text-slate-300 min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-2">Customer Info</th>
                            <th className="py-3 px-2">Query Details</th>
                            <th className="py-3 px-2 text-center">Status</th>
                            <th className="py-3 px-2 text-center">Outreach</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {sortedContacts.map((app) => {
                            const appDate = app.createdAt 
                              ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Unknown Date';
                            const showHeader = appDate !== lastDate;
                            lastDate = appDate;
                            return (
                              <React.Fragment key={app.id}>
                                {showHeader && (
                                  <tr className="bg-slate-900/40">
                                    <td colSpan={5} className="py-2.5 px-3 font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest border-y border-slate-800/80">
                                      📅 {appDate}
                                    </td>
                                  </tr>
                                )}
                          <tr key={app.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 px-2">
                              <span className="font-bold text-white block text-sm">{app.applicantName}</span>
                              <span className="text-[10px] text-slate-400 block mt-1">{app.phone} | {app.email}</span>
                            </td>
                            <td className="py-4 px-2 text-slate-305 max-w-[280px] break-words whitespace-normal leading-relaxed">
                              {app.experienceDesc}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                {getCleanStatusLabel(app.status)}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => shareViaWhatsApp(app, false)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-450 transition-colors border border-slate-700/80"
                                  title="WhatsApp Chat Outreach"
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.43.003 9.85-4.403 9.853-9.83.002-2.628-1.018-5.1-2.868-6.952C16.591 1.97 14.121.95 11.5.951c-5.433 0-9.855 4.407-9.858 9.835-.001 1.706.467 3.373 1.356 4.821l-.994 3.634 3.72-.977zm11.582-7.14c-.29-.145-1.716-.847-1.978-.942-.262-.096-.453-.145-.643.14-.19.285-.736.942-.903 1.133-.166.19-.332.213-.622.068-.29-.145-1.22-.45-2.323-1.433-.859-.766-1.438-1.712-1.606-2.002-.166-.29-.018-.447.127-.591.13-.13.29-.34.435-.508.145-.17.193-.285.29-.475.097-.19.047-.356-.024-.5-.071-.144-.643-1.551-.881-2.122-.232-.559-.467-.482-.643-.491-.167-.008-.356-.01-.546-.01s-.5.071-.762.356c-.262.285-.999.976-.999 2.38s1.022 2.762 1.165 2.953c.143.19 2.011 3.071 4.871 4.303.68.293 1.21.468 1.623.6a3.896 3.896 0 0 0 1.777.112c.548-.08 1.716-.701 1.954-1.378.24-.678.24-1.258.167-1.378-.072-.12-.262-.19-.553-.336z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => shareViaEmail(app, false)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-455 transition-colors border border-slate-700/80"
                                  title="Email Outreach"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={updatingId !== null || getCleanStatusLabel(app.status) === 'PENDING'}
                                  onClick={() => handleUpdateStatus(app.id, 'PENDING')}
                                  className="bg-orange-500/10 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all"
                                >
                                  Pending
                                </button>
                                <button
                                  disabled={updatingId !== null || getCleanStatusLabel(app.status) === 'CLOSED'}
                                  onClick={() => handleUpdateStatus(app.id, 'CLOSED')}
                                  className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all"
                                >
                                  Closed
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

            {/* C. OUTLET REGISTERS & MAP VIEW */}
            {activeTab === 'stores' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
                
                {/* Left (2/3 width) - Outlets list */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  
                  {/* Live Stores */}
                  <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                    <h4 className="text-xs text-emerald-450 font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <span>🟢 Active Live Outlets</span>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black">
                        {stores.filter((s) => s.type === 'LIVE').length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {stores.filter((s) => s.type === 'LIVE').map((store) => (
                        <div key={store.id} className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-white leading-normal text-sm">{store.name}</h5>
                            <p className="text-[10px] text-slate-400 leading-normal">{store.address}</p>
                            <div className="text-[10px] text-slate-450 mt-1 font-semibold flex items-center justify-between">
                              <span>Phone: {store.phone}</span>
                              <a
                                href={getMapLink(store)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all flex items-center gap-0.5"
                                title="Open location in Google Maps"
                              >
                                📍 Map Link
                              </a>
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">Coords: {store.latitude}, {store.longitude}</div>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-slate-800 mt-2">
                            <button
                              onClick={() => handleToggleStoreType(store.id, 'LIVE')}
                              className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                            >
                              Make Upcoming
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="text-[9px] font-bold text-rose-455 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Stores */}
                  <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                    <h4 className="text-xs text-orange-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <span>🟠 Upcoming Outlets (Launching Soon)</span>
                      <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-black">
                        {stores.filter((s) => s.type !== 'LIVE').length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {stores.filter((s) => s.type !== 'LIVE').map((store) => (
                        <div key={store.id} className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h5 className="font-bold text-white leading-normal text-sm">{store.name}</h5>
                            <p className="text-[10px] text-slate-400 leading-normal">{store.address}</p>
                            <div className="text-[10px] text-slate-455 mt-1 font-semibold flex items-center justify-between">
                              <span>Phone: {store.phone}</span>
                              <a
                                href={getMapLink(store)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all flex items-center gap-0.5"
                                title="Open location in Google Maps"
                              >
                                📍 Map Link
                              </a>
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">Coords: {store.latitude}, {store.longitude}</div>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-slate-800 mt-2">
                            <button
                              onClick={() => handleToggleStoreType(store.id, 'UPCOMING')}
                              className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                            >
                              Make Live
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="text-[9px] font-bold text-rose-455 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right (1/3 width) - Registration Form */}
                <div className="bg-[#111827]/80 border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4 lg:col-span-1">
                  <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                    <span>🏪 Add Store Location</span>
                  </h4>
                  <form onSubmit={handleAddStore} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Store Name <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EcoFone Pune Hub"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Address Location {storeType !== 'UPCOMING' && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                      <textarea
                        required={storeType !== 'UPCOMING'}
                        rows={2}
                        placeholder={storeType === 'UPCOMING' ? "Street, City, Pin details (Optional)" : "Street, City, Pin details"}
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Contact Phone {storeType !== 'UPCOMING' && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                       <input
                        type="tel"
                        required={storeType !== 'UPCOMING'}
                        maxLength={10}
                        pattern="^[6-9]\d{9}$"
                        title="Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)"
                        placeholder={storeType === 'UPCOMING' ? "e.g. 9999911111 (Optional)" : "e.g. 9999911111"}
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
 
                    {/* Interactive Leaflet Pin Map */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                        📍 Pin Store Location on Map
                      </label>
                      <div 
                        id="admin-outlet-map" 
                        className="w-full h-44 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden relative z-20"
                        title="Click map or drag the green marker to pin coordinates"
                      />
                      <p className="text-[9px] text-slate-500 leading-normal">
                        Click on the map or drag the green dot marker to manually correct coordinates.
                      </p>
                    </div>
                    
                    {/* Google Maps URL Share Field (Necessary) */}
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Google Maps Link / URL {storeType !== 'UPCOMING' && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                      <input
                        type="url"
                        required={storeType !== 'UPCOMING'}
                        placeholder={storeType === 'UPCOMING' ? "https://maps.app.goo.gl/... (Optional)" : "https://maps.app.goo.gl/... or full maps URL"}
                        value={mapsUrl}
                        onChange={handleMapsUrlChange}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      {mapStatus && (
                        <p className={`text-[10px] mt-1.5 font-bold ${
                          mapStatus.includes('✓') ? 'text-emerald-400' : 'text-orange-400'
                        }`}>{mapStatus}</p>
                      )}
                    </div>

                    <details className="group border border-slate-800 rounded-xl px-3 py-2.5 bg-slate-900/30">
                      <summary className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
                        <span>⚙️ View/Edit Coordinates</span>
                        <span className="text-[9px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                            Latitude (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="e.g. 18.5204"
                            value={storeLat}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStoreLat(val);
                              const parsedLat = parseFloat(val);
                              const parsedLng = parseFloat(storeLng);
                              const currentMap = mapRef.current || mapInstance;
                              const currentMarker = markerRef.current || mapMarker;
                              if (!isNaN(parsedLat) && !isNaN(parsedLng) && currentMarker && currentMap) {
                                currentMarker.setLatLng([parsedLat, parsedLng]);
                                currentMap.setView([parsedLat, parsedLng]);
                              }
                            }}
                            className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                            Longitude (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            placeholder="e.g. 73.8567"
                            value={storeLng}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStoreLng(val);
                              const parsedLat = parseFloat(storeLat);
                              const parsedLng = parseFloat(val);
                              const currentMap = mapRef.current || mapInstance;
                              const currentMarker = markerRef.current || mapMarker;
                              if (!isNaN(parsedLat) && !isNaN(parsedLng) && currentMarker && currentMap) {
                                currentMarker.setLatLng([parsedLat, parsedLng]);
                                currentMap.setView([parsedLat, parsedLng]);
                              }
                            }}
                            className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </details>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">Store Classification</label>
                      <select
                        value={storeType}
                        onChange={(e) => setStoreType(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="LIVE">Live Store</option>
                        <option value="UPCOMING">Upcoming Store</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isAddingStore}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow hover:scale-[1.01]"
                    >
                      {isAddingStore ? 'Registering...' : 'Add Store Location'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* D. SYSTEM LOGS (EXPORT HISTORY) VIEW */}
            {activeTab === 'logs' && (
              <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">System Export & Download Logs</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Logs showing CSV/Excel backup downloads and shares in current workspace</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Clear Logs:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleDeleteHistory(e.target.value);
                          e.target.value = ''; // reset selection
                        }
                      }}
                      className="bg-[#1F2937]/80 border border-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">Select range...</option>
                      <option value="today">Today's Logs</option>
                      <option value="yesterday">Yesterday's Logs</option>
                      <option value="1month">Older than 1 Month</option>
                      <option value="3months">Older than 3 Months</option>
                      <option value="all">Clear All History</option>
                    </select>
                  </div>
                </div>
                {!downloadHistory.length ? (
                  <div className="text-xs text-slate-505 text-center py-16">No exports or shares recorded in the current session logs.</div>
                ) : (
                  <div className="overflow-x-auto text-[11px] sm:text-xs">
                    <table className="w-full text-left text-slate-300 min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-2">Export Log ID</th>
                          <th className="py-3 px-2">Action / Export Type</th>
                          <th className="py-3 px-2">Operator</th>
                          <th className="py-3 px-2">Execution Timestamp</th>
                          <th className="py-3 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {downloadHistory.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-4 px-2 text-slate-500 font-mono text-[10px]">{log.id.slice(0, 8)}...</td>
                            <td className="py-4 px-2 font-bold text-white">{log.action}</td>
                            <td className="py-4 px-2 text-emerald-450 font-bold">{log.operator} <span className="text-[9px] text-slate-500 font-normal">({log.role})</span></td>
                            <td className="py-4 px-2">{log.createdAt ? (new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })) : 'N/A'}</td>
                            <td className="py-4 px-2 text-right">
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 px-2 py-0.5 rounded font-extrabold uppercase">
                                SUCCESS
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* E. TEAM MEMBERS MANAGEMENT VIEW */}
            {activeTab === 'team' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left (2/3 width) - Team Members list */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-800">
                      <span>👥 Active Key Team Members</span>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black">
                        {teamMembers.length}
                      </span>
                    </h4>
                    {!teamMembers.length ? (
                      <div className="text-xs text-slate-500 text-center py-16">
                        No team members registered. Use the panel on the right to add key staff.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all duration-200"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs">
                                    {member.initials}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white leading-normal text-sm">{member.name}</h5>
                                    <span className="text-[9px] text-ecoOrange-500 font-bold uppercase tracking-wider block">{member.role}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-800/40">{member.bio}</p>
                            </div>
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800 mt-2">
                              <button
                                onClick={() => {
                                  setEditTeamMember(member);
                                  setEditTeamName(member.name);
                                  setEditTeamRole(member.role);
                                  setEditTeamBio(member.bio);
                                  setEditTeamImageUrl(member.imageUrl || '');
                                  setEditImageSourceType(member.imageUrl && member.imageUrl.startsWith('data:') ? 'upload' : 'url');
                                  setEditTeamLinkedin(member.linkedinUrl || '');
                                  setEditTeamTwitter(member.twitterUrl || '');
                                  setEditTeamGithub(member.githubUrl || '');
                                  setEditTeamError('');
                                }}
                                className="text-[9px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                Edit Details
                              </button>
                              <button
                                onClick={() => handleDeleteTeamMember(member.id)}
                                className="text-[9px] font-bold text-rose-455 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right (1/3 width) - Add Team Member Form */}
                <div className="lg:col-span-1 bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80">
                    <h4 className="text-xs text-slate-100 font-extrabold uppercase tracking-widest">Register Staff Member</h4>
                    <p className="text-[9px] text-slate-450 mt-1">Append key founders/technicians to display cards roster</p>
                  </div>

                  <form onSubmit={handleAddTeamMember} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Full Name <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ishaan Verma"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Role / Designation <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lead Hardware Architect"
                        value={teamRole}
                        onChange={(e) => setTeamRole(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Bio / Short Description <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Detail professional background (max 150 chars)"
                        maxLength={200}
                        value={teamBio}
                        onChange={(e) => setTeamBio(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Staff Photo Source
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => { setImageSourceType('upload'); setTeamImageUrl(''); }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                            imageSourceType === 'upload'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-455'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => { setImageSourceType('url'); setTeamImageUrl(''); }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                            imageSourceType === 'url'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-455'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>

                      {imageSourceType === 'upload' ? (
                        <div className="space-y-2">
                          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-all relative bg-[#1F2937]/20">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleTeamFileChange(e, false)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-1.5">
                              <span className="text-xl block">📷</span>
                              <span className="text-[10px] font-bold text-slate-350 block">Click or Drag Portrait Photo</span>
                              <span className="text-[8px] text-slate-500 block">PNG, JPG, or WEBP (Max 2MB)</span>
                            </div>
                          </div>
                          {teamImageUrl && teamImageUrl.startsWith('data:') && (
                            <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                              <div className="flex items-center gap-2">
                                <img src={teamImageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-750" />
                                <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Photo Loaded</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setTeamImageUrl('')}
                                className="text-[10px] text-rose-400 hover:text-rose-350 font-bold px-2 py-1"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="url"
                            placeholder="e.g. https://images.unsplash.com/..."
                            value={teamImageUrl}
                            onChange={(e) => setTeamImageUrl(e.target.value)}
                            className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          {teamImageUrl && (
                            <div className="mt-2 p-2 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-2">
                              <img src={teamImageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-750" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                              <span className="text-[9px] text-slate-400">External URL Preview</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        LinkedIn Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={teamLinkedin}
                        onChange={(e) => setTeamLinkedin(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        Twitter / X Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/username"
                        value={teamTwitter}
                        onChange={(e) => setTeamTwitter(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                        GitHub Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={teamGithub}
                        onChange={(e) => setTeamGithub(e.target.value)}
                        className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAddingTeam}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow hover:scale-[1.01]"
                    >
                      {isAddingTeam ? 'Registering...' : 'Add Team Member'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* E. SECURITY SETTINGS (CHANGE PASSWORD & SUB-ADMINS) VIEW */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-4xl">
                {/* Left Card: Master Password Update */}
                <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80">
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                      <span>🔑 Master Security Credentials</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Change the master password used to authorize administrative features.</p>
                  </div>
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1.5 text-[10px] uppercase tracking-wider">
                        Current Password <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-650"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1.5 text-[10px] uppercase tracking-wider">
                        New Password <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="•••••••• (Min 6 chars)"
                        value={newPasswordInput}
                        onChange={(e) => {
                          setNewPasswordInput(e.target.value);
                          setPasswordChangeError('');
                        }}
                        className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-650"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1.5 text-[10px] uppercase tracking-wider">
                        Confirm New Password <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => {
                          setConfirmPasswordInput(e.target.value);
                          setPasswordChangeError('');
                        }}
                        className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-slate-650"
                      />
                    </div>

                    {passwordChangeError && (
                      <div className="text-rose-400 text-[11px] font-bold bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{passwordChangeError}</span>
                      </div>
                    )}

                    {passwordChangeStatus && (
                      <div className="text-emerald-450 text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                        <span>✅</span>
                        <span>{passwordChangeStatus}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/10 hover:scale-[1.01]"
                    >
                      Update Security Password
                    </button>
                  </form>
                </div>

                {/* Right Card: Sub-Admin Accounts Management */}
                <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80">
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">Sub-Admin Management</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Create up to 3 sub-admin accounts and customize their administrative access levels.</p>
                  </div>

                  {/* Sub-Admins list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sub-Admins ({subAdmins.length}/3)</h4>
                    {subAdmins.length === 0 ? (
                      <p className="text-[10px] text-slate-550 italic py-2">No sub-admin accounts configured.</p>
                    ) : (
                      <div className="space-y-2">
                        {subAdmins.map((sa) => (
                          <div key={sa.id} className="flex items-center justify-between bg-[#1F2937]/30 border border-slate-800 rounded-2xl px-4 py-3 text-xs">
                            <div className="max-w-[55%]">
                              <p className="font-extrabold text-slate-200">{sa.username}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(sa.permissions || ['franchise', 'contact']).map((perm) => (
                                  <span key={perm} className="text-[8px] font-extrabold text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase tracking-wider">
                                    {perm === 'stores' ? 'outlets' : perm === 'franchise' ? 'franchise' : perm === 'contact' ? 'contact' : perm === 'team' ? 'team' : perm}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditSubAdminClick(sa.id, sa.username, sa.permissions)}
                                className="text-[9px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 px-2 py-1 rounded-lg transition-all"
                              >
                                Access
                              </button>
                              <button
                                onClick={() => handleResetSubAdminClick(sa.id, sa.username)}
                                className="text-[9px] font-bold text-emerald-455 hover:text-emerald-350 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 px-2 py-1 rounded-lg transition-all"
                              >
                                Pass
                              </button>
                              <button
                                onClick={() => handleRevokeClick(sa.id, sa.username)}
                                className="text-[9px] font-bold text-rose-455 hover:text-rose-350 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 px-2 py-1 rounded-lg transition-all"
                              >
                                Revoke
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create form (shown only if limit is not exceeded) */}
                  {subAdmins.length < 3 ? (
                    <form onSubmit={handleCreateSubAdmin} className="space-y-4 text-xs pt-2 border-t border-slate-800/80">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Sub-Admin Credentials</h4>
                      
                      {subAdminError && (
                        <div className="text-rose-450 text-[10px] font-bold bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg">
                          {subAdminError}
                        </div>
                      )}

                      {subAdminSuccess && (
                        <div className="text-emerald-450 text-[10px] font-bold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                          {subAdminSuccess}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[9px] uppercase tracking-wider">Username</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. rahul"
                            value={subAdminUsername}
                            onChange={(e) => {
                              setSubAdminUsername(e.target.value);
                              setSubAdminError('');
                            }}
                            className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-semibold mb-1 text-[9px] uppercase tracking-wider">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Min. 6 chars"
                            value={subAdminPassword}
                            onChange={(e) => {
                              setSubAdminPassword(e.target.value);
                              setSubAdminError('');
                            }}
                            className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Checkboxes for custom access levels */}
                      <div className="space-y-2 pt-1">
                        <label className="block text-slate-450 font-semibold text-[9px] uppercase tracking-wider mb-1">Select Access Permissions</label>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {[
                            { id: 'franchise', label: 'Franchise Apps' },
                            { id: 'contact', label: 'Contact Inquiries' },
                            { id: 'stores', label: 'Manage Outlets' },
                            { id: 'team', label: 'Team Members' },
                            { id: 'logs', label: 'System Export Logs' },
                            { id: 'reviews', label: 'Review Moderation' },
                          ].map((item) => (
                            <label key={item.id} className="flex items-center gap-2 bg-[#1F2937]/35 border border-slate-800/80 rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1F2937]/60 transition-all">
                              <input
                                type="checkbox"
                                checked={newAdminPermissions.includes(item.id)}
                                onChange={() => {
                                  setNewAdminPermissions((prev) =>
                                    prev.includes(item.id) ? prev.filter((p) => p !== item.id) : [...prev, item.id]
                                  );
                                  setSubAdminError('');
                                }}
                                className="rounded bg-slate-800 border-slate-750 text-emerald-600 focus:ring-emerald-500/20 w-3.5 h-3.5"
                              />
                              <span className="text-slate-350 font-bold select-none">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#0a2d1a] hover:bg-[#0c3d23] border border-emerald-500/10 text-white font-extrabold py-3 rounded-xl transition-all shadow hover:scale-[1.01]"
                      >
                        Create Sub-Admin Account
                      </button>
                    </form>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/10 text-amber-450 p-4 rounded-2xl text-[10px] text-center font-bold">
                      ⚠ Maximum limit of 3 sub-admin credentials created. Remove an active credential to add a new account.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* D. REVIEWS MODERATION VIEW */}
            {activeTab === 'reviews' && (() => {
              let lastDate = '';
              const filteredReviews = reviews.filter(r => r.status === reviewFilterStatus);
              const sortedReviews = [...filteredReviews].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              return (
                <div className="bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                        <span>⭐ Reviews Moderation Registry</span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Moderate existing client feedback or post official Business Owner reviews to feature on the storefront.</p>
                    </div>
                    <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                      <button
                        onClick={() => setOwnerReviewOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow flex items-center gap-1.5"
                        title="Publish an official Business Owner Review"
                      >
                        <span>🏢 Write Business Owner Review</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Show Status:</span>
                        <select
                          value={reviewFilterStatus}
                          onChange={(e: any) => setReviewFilterStatus(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                        >
                          <option value="PENDING">Pending Approval</option>
                          <option value="APPROVED">Approved / Live</option>
                          <option value="REJECTED">Rejected / Hidden</option>
                        </select>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-455 px-2.5 py-1 rounded font-medium border border-slate-800/60">
                        {filteredReviews.length} Matches
                      </span>
                    </div>
                  </div>
                  {!filteredReviews.length ? (
                    <div className="text-xs text-slate-500 text-center py-16">
                      No reviews found matching the status: <strong className="text-slate-350">{reviewFilterStatus}</strong>.
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-[11px] sm:text-xs">
                      <table className="w-full text-left text-slate-300 min-w-[900px]">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-2">Author / Product</th>
                            <th className="py-3 px-2 text-center">Rating</th>
                            <th className="py-3 px-2">Review Comment</th>
                            <th className="py-3 px-2 text-center">Status</th>
                            <th className="py-3 px-2 text-right">Moderation Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {sortedReviews.map((rev) => {
                            const revDate = rev.createdAt 
                              ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Unknown Date';
                            const showHeader = revDate !== lastDate;
                            lastDate = revDate;
                            const isOwner = rev.verifiedProduct?.toLowerCase().includes('owner') || rev.verifiedProduct?.toLowerCase().includes('business');
                            return (
                              <React.Fragment key={rev.id}>
                                {showHeader && (
                                  <tr className="bg-slate-900/40">
                                    <td colSpan={5} className="py-2.5 px-3 font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest border-y border-slate-800/80">
                                      📅 {revDate}
                                    </td>
                                  </tr>
                                )}
                                <tr className="hover:bg-slate-900/30 transition-colors">
                                  <td className="py-4 px-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white block text-sm">{rev.authorName}</span>
                                      {rev.isVerified && (
                                        <span className={`text-[9px] font-extrabold border px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                          isOwner
                                            ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                                        }`}>
                                          {isOwner ? '🏢 Verified Business Owner' : '✓ Verified Buyer'}
                                        </span>
                                      )}
                                    </div>
                                    {rev.verifiedProduct && (
                                      <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">
                                        🛒 {rev.verifiedProduct}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-2 text-center">
                                    <div className="flex items-center justify-center gap-0.5 text-sm">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span 
                                          key={i} 
                                          className={i < rev.rating ? 'text-amber-450' : 'text-slate-700'}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 text-slate-300 max-w-[300px] break-words whitespace-normal leading-relaxed">
                                    <div className="space-y-2">
                                      <p className="text-slate-350">"{rev.comment}"</p>
                                      {rev.adminReply && (
                                        <div className="bg-[#1f2937]/35 border border-[#374151]/40 rounded-xl p-2.5 space-y-1">
                                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-455 block">
                                            Admin Reply:
                                          </span>
                                          <p className="text-[10px] text-slate-400 leading-normal italic">
                                            "{rev.adminReply}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 text-center">
                                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                      rev.status === 'APPROVED' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                        : rev.status === 'REJECTED' 
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/25'
                                    }`}>
                                      {rev.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-2 text-right">
                                    <div className="flex items-center justify-end flex-wrap gap-1.5">
                                      <button
                                        disabled={updatingId !== null || rev.status === 'APPROVED'}
                                        onClick={() => handleUpdateReviewStatus(rev.id, 'APPROVED')}
                                        className="bg-[#0a2d1a] hover:bg-[#0c3d23] text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all uppercase tracking-wider"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        disabled={updatingId !== null || rev.status === 'REJECTED'}
                                        onClick={() => handleUpdateReviewStatus(rev.id, 'REJECTED')}
                                        className="bg-[#3b0d11] hover:bg-[#521319] text-rose-455 border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 transition-all uppercase tracking-wider"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        disabled={updatingId !== null || rev.isVerified}
                                        onClick={() => handleToggleReviewVerified(rev.id, rev.isVerified)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 uppercase tracking-wider ${
                                          rev.isVerified 
                                            ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/25' 
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                        }`}
                                      >
                                        {rev.isVerified 
                                          ? (isOwner ? '✓ Verified Owner' : '✓ Verified') 
                                          : (isOwner ? 'Verify Owner' : 'Verify Buyer')}
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (activeReplyReviewId === rev.id) {
                                            setActiveReplyReviewId(null);
                                            setReplyInputText('');
                                          } else {
                                            setActiveReplyReviewId(rev.id);
                                            setReplyInputText(rev.adminReply || '');
                                          }
                                        }}
                                        className="bg-[#1f2937] hover:bg-[#374151] text-slate-300 border border-[#4b5563]/30 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                                      >
                                        {activeReplyReviewId === rev.id ? 'Cancel' : rev.adminReply ? 'Edit Reply' : 'Reply'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingReviewId(rev.id);
                                          setEditAuthorName(rev.authorName);
                                          setEditRating(rev.rating);
                                          setEditComment(rev.comment);
                                          setEditVerifiedProduct(rev.verifiedProduct || '');
                                          setEditReviewOpen(true);
                                        }}
                                        className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        disabled={updatingId !== null}
                                        onClick={() => handleDeleteReview(rev.id)}
                                        className="bg-rose-500/10 hover:bg-rose-600 text-rose-455 hover:text-white border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {activeReplyReviewId === rev.id && (
                                  <tr className="bg-slate-900/40">
                                    <td colSpan={5} className="py-3.5 px-4 border-t border-slate-800">
                                      <div className="flex flex-col gap-2 max-w-2xl">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                          EcoFone Response Text
                                        </label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={replyInputText}
                                            onChange={(e) => setReplyInputText(e.target.value)}
                                            placeholder="Write official response message..."
                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-emerald-500/50"
                                          />
                                          <button
                                            disabled={isSubmittingReply || !replyInputText.trim()}
                                            onClick={() => handleUpdateReviewReply(rev.id)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap"
                                          >
                                            {isSubmittingReply ? 'Saving...' : 'Save Response'}
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === 'certificates' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                {/* Entry registration form */}
                <div className="lg:col-span-1 bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="pb-3 border-b border-slate-800/80">
                    <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                      <span>📝 Register Intern / Employee Entry</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Add intern or employee details to register their verification entry and generate a QR code for their physical certificate.</p>
                  </div>

                  <form onSubmit={handleCreateCertificateSubmit} className="space-y-3.5 text-xs text-slate-350">
                    {certFormError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
                        {certFormError}
                      </div>
                    )}
                    {certFormSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                        {certFormSuccess}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name of Employee/Intern *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificate Category *</label>
                      <select
                        value={newCertType}
                        onChange={(e) => setNewCertType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 animate-none"
                      >
                        <option value="INTERNSHIP">Internship Certificate</option>
                        <option value="EXPERIENCE">Experience Certificate</option>
                        <option value="EXCELLENCE">Certificate of Excellence</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role / Designation *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Web Development & Social Media Intern"
                        value={newCertRole}
                        onChange={(e) => setNewCertRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date *</label>
                        <input
                          type="date"
                          required
                          max={todayStr}
                          value={newCertStartDate}
                          onChange={(e) => setNewCertStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date *</label>
                        <input
                          type="date"
                          required
                          max={todayStr}
                          value={newCertEndDate}
                          onChange={(e) => setNewCertEndDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Date *</label>
                      <input
                        type="date"
                        required
                        max={todayStr}
                        value={newCertIssueDate}
                        onChange={(e) => setNewCertIssueDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={certFormLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>{certFormLoading ? 'Registering...' : 'Save Record & Generate QR'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Verification Records & QR Registry */}
                <div className="lg:col-span-2 bg-[#111827]/80 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 font-sans">
                  <div className="pb-3.5 border-b border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                        <span>Official Certificate Verification Registry</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">Immutable official audit database and QR asset management.</p>
                    </div>

                    {/* Formal From Date to To Date Range Filter */}
                    <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-1.5 px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From:</span>
                        <input
                          type="date"
                          max={todayStr}
                          value={filterFromDate}
                          onChange={(e) => setFilterFromDate(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 px-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To:</span>
                        <input
                          type="date"
                          max={todayStr}
                          value={filterToDate}
                          onChange={(e) => setFilterToDate(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          onClick={() => { setFilterFromDate(todayStr); setFilterToDate(todayStr); }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${filterFromDate === todayStr && filterToDate === todayStr ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => { setFilterFromDate(''); setFilterToDate(''); }}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${!filterFromDate && !filterToDate ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                          All Records
                        </button>
                      </div>
                    </div>
                  </div>

                  {certificates.filter((cert) => {
                    if (!filterFromDate && !filterToDate) return true;
                    try {
                      const certDate = new Date(cert.issueDate || cert.createdAt).toISOString().split('T')[0];
                      if (filterFromDate && certDate < filterFromDate) return false;
                      if (filterToDate && certDate > filterToDate) return false;
                      return true;
                    } catch {
                      return true;
                    }
                  }).length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10">
                      {filterFromDate === todayStr && filterToDate === todayStr
                        ? "No verification records registered today. Register an entry using the form on the left."
                        : (filterFromDate || filterToDate)
                          ? "No verification records found within the selected date range."
                          : "No verification records created yet."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                            <th className="py-3 px-4">QR Asset</th>
                            <th className="py-3 px-4">UID & Recipient</th>
                            <th className="py-3 px-4">Category & Role</th>
                            <th className="py-3 px-4">Issue Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60 text-slate-300">
                          {certificates
                            .filter((cert) => {
                              if (!filterFromDate && !filterToDate) return true;
                              try {
                                const certDate = new Date(cert.issueDate || cert.createdAt).toISOString().split('T')[0];
                                if (filterFromDate && certDate < filterFromDate) return false;
                                if (filterToDate && certDate > filterToDate) return false;
                                return true;
                              } catch {
                                return true;
                              }
                            })
                            .map((cert) => (
                            <tr key={cert.id} className="hover:bg-slate-900/20">
                              <td className="py-3 px-4">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ecofone-frontend-new.vercel.app/verify-certificate/${cert.uid}`}
                                  alt="Verification QR"
                                  className="w-12 h-12 object-contain bg-white p-1 rounded-lg border border-slate-700 shadow-sm"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono text-emerald-400 font-bold block">{cert.uid}</span>
                                <span className="font-extrabold text-slate-100 block text-sm mt-0.5 uppercase tracking-wide">{cert.recipientName?.toUpperCase()}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wide">
                                  {cert.type}
                                </span>
                                {cert.startDate && cert.endDate && (
                                  <span className="text-[9px] font-extrabold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded ml-1.5 uppercase tracking-wide">
                                    Tenure: {calculateTenure(cert.startDate, cert.endDate)}
                                  </span>
                                )}
                                <span className="text-slate-300 font-medium block mt-1">{cert.role}</span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-medium font-mono text-xs">
                                {new Date(cert.issueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end gap-1.5 w-36 ml-auto">
                                  <button
                                    onClick={() => handleDownloadQrCode(cert.uid)}
                                    className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-[11px] rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                  >
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Download QR Asset</span>
                                  </button>
                                  <a
                                    href={`/verify-certificate/${cert.uid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-[11px] rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                  >
                                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>View Portal</span>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {makeLiveStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/75 backdrop-blur-md transition-all duration-300 p-4">
          <div className="w-full max-w-md bg-[#111827]/95 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <button 
              type="button" 
              onClick={() => setMakeLiveStore(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 text-lg transition-colors"
            >
              ✕
            </button>
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Outreach Setup
              </span>
              <h3 className="font-display font-extrabold text-white text-base">Make {makeLiveStore.name} Live</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Please provide the contact and directions details required for customer locator cards.
              </p>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setMakeLiveError('');

                const cleanPhone = makeLivePhone.replace(/\D/g, '');
                let finalPhone = cleanPhone;
                if (cleanPhone.length > 10) {
                  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
                    finalPhone = cleanPhone.slice(2);
                  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
                    finalPhone = cleanPhone.slice(1);
                  }
                }

                if (!makeLiveAddress.trim()) {
                  setMakeLiveError('Address is required to make the store live.');
                  return;
                }
                if (!/^[6-9]\d{9}$/.test(finalPhone)) {
                  setMakeLiveError('Please enter a valid 10-digit Indian mobile number.');
                  return;
                }
                if (!makeLiveMapsUrl.trim() || !makeLiveMapsUrl.trim().startsWith('http')) {
                  setMakeLiveError('Please enter a valid Google Maps URL link.');
                  return;
                }

                setIsLoading(true);
                try {
                  const embedUrl = convertToEmbedUrl(makeLiveMapsUrl);
                  await api.updateStore(makeLiveStore.id, {
                    type: 'LIVE',
                    address: makeLiveAddress.trim(),
                    phone: finalPhone,
                    mapsUrl: embedUrl
                  });
                  setMakeLiveStore(null);
                  await loadDashboardData();
                } catch (err: any) {
                  setMakeLiveError(`Update failed: ${err.message}`);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-3.5 text-xs text-slate-300"
            >
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Address Location <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={makeLiveAddress}
                  onChange={(e) => setMakeLiveAddress(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Street, City, Pin details"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Contact Phone <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={12}
                  value={makeLivePhone}
                  onChange={(e) => setMakeLivePhone(e.target.value.replace(/[^0-9+]/g, ''))}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Google Maps Link / URL <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={makeLiveMapsUrl}
                  onChange={(e) => setMakeLiveMapsUrl(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              {makeLiveError && (
                <div className="text-rose-455 text-[11px] font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  ⚠️ {makeLiveError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMakeLiveStore(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md"
                >
                  Make Live 🟢
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTeamMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16]/75 backdrop-blur-md transition-all duration-300 p-4">
          <div className="w-full max-w-md bg-[#111827]/95 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <button 
              type="button" 
              onClick={() => setEditTeamMember(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 text-lg transition-colors"
            >
              ✕
            </button>
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-450 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Staff Configuration
              </span>
              <h3 className="font-display font-extrabold text-white text-base">Edit {editTeamMember.name} Details</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Update designation and professional bio profile settings.
              </p>
            </div>
            
            <form onSubmit={handleEditTeamMemberSubmit} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Role / Designation <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTeamRole}
                  onChange={(e) => setEditTeamRole(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Bio / Short Description <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={editTeamBio}
                  onChange={(e) => setEditTeamBio(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Staff Photo Source
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setEditImageSourceType('upload'); setEditTeamImageUrl(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                      editImageSourceType === 'upload'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-455'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditImageSourceType('url'); setEditTeamImageUrl(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                      editImageSourceType === 'url'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-455'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {editImageSourceType === 'upload' ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-all relative bg-[#1F2937]/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTeamFileChange(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1.5">
                        <span className="text-xl block">📷</span>
                        <span className="text-[10px] font-bold text-slate-350 block">Click or Drag Portrait Photo</span>
                        <span className="text-[8px] text-slate-500 block">PNG, JPG, or WEBP (Max 2MB)</span>
                      </div>
                    </div>
                    {editTeamImageUrl && editTeamImageUrl.startsWith('data:') && (
                      <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2">
                          <img src={editTeamImageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-750" />
                          <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Photo Loaded</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditTeamImageUrl('')}
                          className="text-[10px] text-rose-400 hover:text-rose-350 font-bold px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={editTeamImageUrl}
                      onChange={(e) => setEditTeamImageUrl(e.target.value)}
                      className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    {editTeamImageUrl && (
                      <div className="mt-2 p-2 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center gap-2">
                        <img src={editTeamImageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-750" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                        <span className="text-[9px] text-slate-400">External URL Preview</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={editTeamLinkedin}
                  onChange={(e) => setEditTeamLinkedin(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  Twitter / X Profile URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://twitter.com/username"
                  value={editTeamTwitter}
                  onChange={(e) => setEditTeamTwitter(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase tracking-wider">
                  GitHub Profile URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={editTeamGithub}
                  onChange={(e) => setEditTeamGithub(e.target.value)}
                  className="w-full bg-[#1F2937]/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {editTeamError && (
                <div className="text-rose-455 text-[11px] font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  ⚠️ {editTeamError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTeamMember(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* G. CLEAR ENQUIRIES CUSTOM MODAL (DROPDOWN AGE FILTER) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🧹 Clear {deleteModalType === 'franchise' ? 'Franchise Leads' : 'Support Tickets'}</span>
              </h3>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the age range of the records you want to delete. This operation cannot be undone.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Select Filter Range</label>
              <select
                value={deleteModalFilter}
                onChange={(e: any) => setDeleteModalFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="1month">Older than 1 Month</option>
                <option value="3months">Older than 3 Months</option>
                <option value="1year">Older than 1 Year</option>
                <option value="all">Delete ALL Records</option>
                <option value="custom">Custom Date Range...</option>
              </select>
            </div>

            {deleteModalFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={deleteStartDate}
                    onChange={(e) => setDeleteStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                  <input
                    type="date"
                    min={deleteStartDate || undefined}
                    max={new Date().toISOString().split('T')[0]}
                    value={deleteEndDate}
                    onChange={(e) => setDeleteEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteLeads}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/10"
              >
                Wipe History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* H. EDIT SUB-ADMIN ACCESS PERMISSIONS CUSTOM MODAL */}
      {editSubAdminOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                🔑 Edit Access: {editSubAdminName}
              </h3>
              <button 
                onClick={() => { setEditSubAdminOpen(false); setEditAccessPassword(''); setEditAccessPasswordError(''); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the administrative sections that this sub-admin is authorized to view and manage.
            </p>

            <form onSubmit={handleUpdateSubAdminPermissionsSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Granted Access Levels</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-200">
                  <label className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={editSubAdminPermissions.includes('franchise')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSubAdminPermissions((prev) => [...prev, 'franchise']);
                        } else {
                          setEditSubAdminPermissions((prev) => prev.filter((p) => p !== 'franchise'));
                        }
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Franchise Registry</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={editSubAdminPermissions.includes('contact')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSubAdminPermissions((prev) => [...prev, 'contact']);
                        } else {
                          setEditSubAdminPermissions((prev) => prev.filter((p) => p !== 'contact'));
                        }
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Customer Queries</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={editSubAdminPermissions.includes('stores')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSubAdminPermissions((prev) => [...prev, 'stores']);
                        } else {
                          setEditSubAdminPermissions((prev) => prev.filter((p) => p !== 'stores'));
                        }
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Outlets Map</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={editSubAdminPermissions.includes('team')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSubAdminPermissions((prev) => [...prev, 'team']);
                        } else {
                          setEditSubAdminPermissions((prev) => prev.filter((p) => p !== 'team'));
                        }
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Team Management</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={editSubAdminPermissions.includes('reviews')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditSubAdminPermissions((prev) => [...prev, 'reviews']);
                        } else {
                          setEditSubAdminPermissions((prev) => prev.filter((p) => p !== 'reviews'));
                        }
                      }}
                      className="accent-emerald-500"
                    />
                    <span>Review Moderation</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditSubAdminOpen(false); setEditAccessPassword(''); setEditAccessPasswordError(''); }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/10"
                >
                  Save Access
                </button>
              </div>

              {/* Master Admin Password Authorization */}
              <div className="border-t border-slate-800 pt-4 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm with Master Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={editAccessPassword}
                  onChange={(e) => { setEditAccessPassword(e.target.value); setEditAccessPasswordError(''); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {editAccessPasswordError && (
                  <div className="text-rose-400 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                    <span>⚠️</span><span>{editAccessPasswordError}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* I. RESET SUB-ADMIN PASSWORD CUSTOM MODAL */}
      {resetSubAdminOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🔒 Reset Password: {resetSubAdminName}</span>
              </h3>
              <button 
                onClick={() => setResetSubAdminOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Master Admin password to authorize and enter a new password for the sub-admin.
            </p>

            <form onSubmit={handleConfirmSubAdminResetSubmit} className="space-y-3.5 text-xs text-slate-350">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">YOUR Master Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetAdminPassword}
                  onChange={(e) => setResetAdminPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Admin New Password</label>
                <input
                  type="password"
                  required
                  placeholder="•••••••• (Min 6 chars)"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {resetPasswordError && (
                <div className="text-rose-455 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{resetPasswordError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetSubAdminOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/10"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {revokeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🚫 Revoke Access: {revokeTargetName}</span>
              </h3>
              <button
                onClick={() => setRevokeConfirmOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently revoke <span className="text-white font-bold">{revokeTargetName}</span>'s admin access. Both passwords are required to confirm.
            </p>

            <form onSubmit={handleConfirmRevoke} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${revokeErrorField === 'master' ? 'text-rose-400' : 'text-slate-400'}`}>Master Admin Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={revokePasswordInput}
                  onChange={(e) => { setRevokePasswordInput(e.target.value); setRevokePasswordError(''); setRevokeErrorField(null); }}
                  className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none transition-colors ${
                    revokeErrorField === 'master' ? 'border-rose-500 bg-rose-500/5' : 'border-slate-800 focus:border-rose-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${revokeErrorField === 'subadmin' ? 'text-rose-400' : 'text-slate-400'}`}>Sub-Admin Password ({revokeTargetName})</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={revokeSubAdminPasswordInput}
                  onChange={(e) => { setRevokeSubAdminPasswordInput(e.target.value); setRevokePasswordError(''); setRevokeErrorField(null); }}
                  className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-slate-200 focus:outline-none transition-colors ${
                    revokeErrorField === 'subadmin' ? 'border-rose-500 bg-rose-500/5' : 'border-slate-800 focus:border-rose-500'
                  }`}
                />
              </div>

              {revokePasswordError && (
                <div className="text-rose-400 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{revokePasswordError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeConfirmOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
                >
                  {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* J. CREATE BUSINESS OWNER REVIEW MODAL */}
      {ownerReviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏢 Write Business Owner Review</span>
              </h3>
              <button 
                onClick={() => setOwnerReviewOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Post an official review or statement as a Store Owner / Franchise Partner. This review will be tagged with <strong className="text-emerald-400">🏢 Verified Business Owner</strong> on the live storefront.
            </p>

            <form onSubmit={handleCreateOwnerReviewSubmit} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner / Franchise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EcoFone Lucknow Store Owner"
                  value={ownerAuthorName}
                  onChange={(e) => setOwnerAuthorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Role / Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verified Business Owner"
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Star Rating (1 to 5)</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOwnerRating(star)}
                      className="text-xl focus:outline-none transition-transform hover:scale-125"
                    >
                      <span className={star <= ownerRating ? 'text-amber-400' : 'text-slate-700'}>★</span>
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">{ownerRating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Content / Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your review or owner statement to display on the storefront..."
                  value={ownerComment}
                  onChange={(e) => setOwnerComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOwnerReviewOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOwnerReview}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/10"
                >
                  {isSubmittingOwnerReview ? 'Publishing...' : 'Publish Business Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* K. EDIT CLIENT REVIEW MODAL */}
      {editReviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>✏️ Edit Customer Review</span>
              </h3>
              <button 
                onClick={() => { setEditReviewOpen(false); setEditingReviewId(null); }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditReviewSubmit} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Author Name</label>
                <input
                  type="text"
                  required
                  placeholder="Author name"
                  value={editAuthorName}
                  onChange={(e) => setEditAuthorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product / Tag</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Refurbished"
                  value={editVerifiedProduct}
                  onChange={(e) => setEditVerifiedProduct(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Star Rating (1 to 5)</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="text-xl focus:outline-none transition-transform hover:scale-125"
                    >
                      <span className={star <= editRating ? 'text-amber-400' : 'text-slate-700'}>★</span>
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold ml-2">{editRating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Review content..."
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditReviewOpen(false); setEditingReviewId(null); }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-colors border border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingReview}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg"
                >
                  {isUpdatingReview ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* M. CUSTOM IN-APP REGISTRATION CONFIRMATION MODAL */}
      {certConfirmModalOpen && pendingCertPayload && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-amber-500/30 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 animate-scale-up text-slate-100 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                  🔒
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Official Registration Notice
                  </h3>
                  <p className="text-[10px] text-amber-400/90 font-medium">Ecovista Global Permanent Records</p>
                </div>
              </div>
              <button
                onClick={() => { setCertConfirmModalOpen(false); setPendingCertPayload(null); }}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Recipient Full Name</span>
                <span className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">{pendingCertPayload.recipientName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Category</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">{pendingCertPayload.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Issue Date</span>
                  <span className="text-xs font-semibold text-slate-300">{pendingCertPayload.issueDate}</span>
                </div>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Role / Designation</span>
                <span className="text-xs font-medium text-slate-300">{pendingCertPayload.role}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-[11px] text-amber-300 leading-relaxed flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <p>
                <strong>Important:</strong> Once saved, this record will be <strong>permanently locked</strong> in the official database and <strong>cannot be modified or deleted</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setCertConfirmModalOpen(false); setPendingCertPayload(null); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCertificateSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Confirm & Register</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* L. FLOATING CORPORATE TOAST NOTIFICATION STACK */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {corporateToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 transition-all transform animate-fade-in ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/50'
                : toast.type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/50'
                  : toast.type === 'warning'
                    ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/50'
                    : 'bg-slate-900/95 border-sky-500/40 text-slate-100 shadow-sky-950/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '🔒' : 'ℹ️'}
              </span>
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-200">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCorporateToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-200 text-sm leading-none p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
