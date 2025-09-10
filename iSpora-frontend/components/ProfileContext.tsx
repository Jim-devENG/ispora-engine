import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extended profile interface that matches MyNetwork user structure
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed from firstName + lastName
  email: string;
  phone: string;
  bio: string;
  location: string;
  company: string;
  position: string;
  title: string; // Same as position for consistency
  website: string;
  linkedIn: string;
  twitter?: string;
  avatar?: string;
  
  // Professional details
  university: string;
  graduationYear: string;
  program: string;
  skills: string[];
  expertise: string[];
  role: 'mentor' | 'professional' | 'alumni' | 'student' | 'researcher' | 'entrepreneur';
  experience: number; // years of experience
  
  // Network details
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  interests: string[];
  mutualConnections: number;
  responseRate: number;
  
  // Diaspora status
  isDiaspora: boolean; // Whether user is part of diaspora community
  diasporaLocation?: string; // Location where user is in diaspora
  homeCountry?: string; // Original home country
  
  // Availability and preferences
  availability: {
    mentoring: boolean;
    collaboration: boolean;
    consultation: boolean;
    volunteering?: boolean;
    speaking?: boolean;
    advising?: boolean;
  };
  openTo: string[]; // What they're open to
  
  // Social links
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
    website?: string;
  };
  
  // Achievements
  achievements: {
    title: string;
    description: string;
    date: string;
  }[];
  
  // University connections
  universities: {
    name: string;
    role: string;
    isVerified: boolean;
  }[];
  
  // Privacy settings
  privacy: {
    profileVisibility: 'public' | 'alumni' | 'private';
    contactVisibility: 'public' | 'alumni' | 'private';
    professionalVisibility: 'public' | 'alumni' | 'private';
  };
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
  };
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  saveProfile: () => Promise<void>;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Default profile data
const defaultProfile: UserProfile = {
  id: 'current-user',
  firstName: 'John',
  lastName: 'Doe',
  name: 'John Doe',
  email: 'john.doe@aspora.co',
  phone: '+1 (555) 123-4567',
  bio: 'Passionate alumni advocate working to bridge the gap between education and industry. I believe in the power of mentorship and giving back to the next generation.',
  location: 'San Francisco, CA',
  company: 'Tech Innovations Inc.',
  position: 'Senior Software Engineer',
  title: 'Senior Software Engineer',
  website: 'https://johndoe.dev',
  linkedIn: 'https://linkedin.com/in/johndoe',
  twitter: 'https://twitter.com/johndoe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  
  // Professional details
  university: 'University of Lagos',
  graduationYear: '2018',
  program: 'BS Computer Science',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Leadership'],
  expertise: ['Full-Stack Development', 'Team Leadership', 'Product Strategy'],
  role: 'professional',
  experience: 6,
  
  // Network details
  isVerified: true,
  isOnline: true,
  lastActive: '2 minutes ago',
  interests: ['Technology', 'Mentorship', 'Startup Culture', 'AI/ML'],
  mutualConnections: 0, // Self
  responseRate: 95,
  
  // Diaspora status
  isDiaspora: true, // User is part of diaspora community
  diasporaLocation: 'San Francisco, CA',
  homeCountry: 'Nigeria',
  
  // Availability and preferences
  availability: {
    mentoring: true,
    collaboration: true,
    consultation: true,
    volunteering: false,
    speaking: true,
    advising: true
  },
  openTo: ['Mentorship', 'Collaboration', 'Consulting', 'Speaking'],
  
  // Social links
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
    email: 'john.doe@aspora.co',
    website: 'https://johndoe.dev'
  },
  
  // Achievements
  achievements: [
    {
      title: 'Tech Leadership Award',
      description: 'Recognized for outstanding leadership in technology innovation',
      date: '2023-11-15'
    },
    {
      title: 'Alumni Mentor of the Year',
      description: 'Awarded for exceptional mentorship contributions',
      date: '2023-06-20'
    }
  ],
  
  // University connections
  universities: [
    {
      name: 'University of Lagos',
      role: 'Alumni & Campaign Creator',
      isVerified: true
    },
    {
      name: 'Makerere University',
      role: 'Campaign Creator',
      isVerified: true
    }
  ],
  
  // Privacy settings
  privacy: {
    profileVisibility: 'public',
    contactVisibility: 'alumni',
    professionalVisibility: 'public'
  },
  
  // Preferences
  preferences: {
    language: 'English',
    timezone: 'PST (GMT-8)',
    theme: 'light'
  }
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile>(defaultProfile);

  // Update computed fields when profile changes
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      name: `${prev.firstName} ${prev.lastName}`,
      title: prev.position,
      socialLinks: {
        ...prev.socialLinks,
        linkedin: prev.linkedIn,
        email: prev.email,
        website: prev.website
      }
    }));
  }, [profile.firstName, profile.lastName, profile.position, profile.linkedIn, profile.email, profile.website]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      // Always update computed fields
      name: updates.firstName || updates.lastName 
        ? `${updates.firstName || prev.firstName} ${updates.lastName || prev.lastName}`
        : prev.name,
      title: updates.position || prev.title,
      socialLinks: {
        ...prev.socialLinks,
        ...(updates.socialLinks || {}),
        linkedin: updates.linkedIn || prev.socialLinks.linkedin,
        email: updates.email || prev.socialLinks.email,
        website: updates.website || prev.socialLinks.website
      }
    }));
  };

  const saveProfile = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setOriginalProfile(profile);
    setIsEditing(false);
    
    // In a real app, you'd make an API call here
    console.log('Profile saved:', profile);
    
    // Update localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const resetProfile = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setOriginalProfile(parsedProfile);
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    }
  }, []);

  return (
    <ProfileContext.Provider value={{
      profile,
      updateProfile,
      isEditing,
      setIsEditing,
      saveProfile,
      resetProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

// Helper function to convert UserProfile to NetworkUser format
export function profileToNetworkUser(profile: UserProfile) {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    title: profile.title,
    company: profile.company,
    location: profile.location,
    university: profile.university,
    graduationYear: profile.graduationYear,
    program: profile.program,
    bio: profile.bio,
    skills: profile.skills,
    expertise: profile.expertise,
    role: profile.role,
    experience: profile.experience,
    connectionStatus: 'connected' as const, // For current user
    mutualConnections: profile.mutualConnections,
    responseRate: profile.responseRate,
    isVerified: profile.isVerified,
    isOnline: profile.isOnline,
    lastActive: profile.lastActive,
    interests: profile.interests,
    socialLinks: profile.socialLinks,
    achievements: profile.achievements,
    availability: profile.availability,
    openTo: profile.openTo,
    isDiaspora: profile.isDiaspora,
    diasporaLocation: profile.diasporaLocation,
    homeCountry: profile.homeCountry
  };
}
