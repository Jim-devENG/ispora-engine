import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../src/utils/supabaseClient';
import { getCurrentUser, onAuthStateChange } from '../src/utils/auth';
import { useAuth } from './AuthContext';

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
    try {
      // Get current user
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        throw new Error('Not authenticated');
      }

      // Update profile in Supabase
      const result = await (supabase
        .from('profiles') as any)
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          bio: profile.bio,
          location: profile.location,
          company: profile.company,
          position: profile.position,
          title: profile.title,
          website: profile.website,
          linkedin: profile.linkedIn,
          twitter: profile.twitter,
          avatar: profile.avatar,
          university: profile.university,
          graduation_year: profile.graduationYear,
          program: profile.program,
          skills: profile.skills,
          expertise: profile.expertise,
          role: profile.role,
          experience: profile.experience,
          is_verified: profile.isVerified,
          is_online: profile.isOnline,
          last_active: profile.lastActive,
          interests: profile.interests,
          mutual_connections: profile.mutualConnections,
          response_rate: profile.responseRate,
          is_diaspora: profile.isDiaspora,
          diaspora_location: profile.diasporaLocation,
          home_country: profile.homeCountry,
          availability: profile.availability,
          open_to: profile.openTo,
          social_links: profile.socialLinks,
          achievements: profile.achievements,
          universities: profile.universities,
          privacy: profile.privacy,
          preferences: profile.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single() as any;

      const { data: updatedProfile, error: updateError } = result;

      if (updateError) {
        throw updateError;
      }

      // Map back to UserProfile format
      if (updatedProfile) {
        const profileData = updatedProfile as any;
        const mappedProfile: UserProfile = {
          id: profileData.id,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          company: profileData.company || '',
          position: profileData.position || '',
          title: profileData.title || profileData.position || '',
          website: profileData.website || '',
          linkedIn: profileData.linkedin || '',
          twitter: profileData.twitter,
          avatar: profileData.avatar,
          university: profileData.university || '',
          graduationYear: profileData.graduation_year || '',
          program: profileData.program || '',
          skills: profileData.skills || [],
          expertise: profileData.expertise || [],
          role: profileData.role as UserProfile['role'],
          experience: profileData.experience || 0,
          isVerified: profileData.is_verified || false,
          isOnline: profileData.is_online || false,
          lastActive: profileData.last_active || new Date().toISOString(),
          interests: profileData.interests || [],
          mutualConnections: profileData.mutual_connections || 0,
          responseRate: profileData.response_rate || 0,
          isDiaspora: profileData.is_diaspora || false,
          diasporaLocation: profileData.diaspora_location,
          homeCountry: profileData.home_country,
          availability: profileData.availability as UserProfile['availability'],
          openTo: profileData.open_to || [],
          socialLinks: profileData.social_links as UserProfile['socialLinks'],
          achievements: profileData.achievements as UserProfile['achievements'],
          universities: profileData.universities as UserProfile['universities'],
          privacy: profileData.privacy as UserProfile['privacy'],
          preferences: profileData.preferences as UserProfile['preferences'],
        };

        setProfile(mappedProfile);
        setOriginalProfile(mappedProfile);
        setIsEditing(false);
        localStorage.setItem('userProfile', JSON.stringify(mappedProfile));
      }
    } catch (error) {
      console.error('Error saving profile to Supabase:', error);
      // Fallback: save to localStorage only
      // TODO: REMOVE_AFTER_SUPABASE_MIGRATION - Remove localStorage fallback once Supabase is fully stable
      setOriginalProfile(profile);
      setIsEditing(false);
      localStorage.setItem('userProfile', JSON.stringify(profile));
      // Show error toast to user
      if (error instanceof Error) {
        console.error('Supabase profile update failed:', error.message);
      }
    }
  };

  const resetProfile = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  // Load profile from Supabase on mount and listen to auth changes
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check for session first (more reliable than getUser)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          // Not authenticated - reset to default profile
          setProfile(defaultProfile);
          setOriginalProfile(defaultProfile);
          return;
        }

        const user = session.user;

        // Load profile from Supabase profiles table
        const { data: profileData, error: profileError } = await (supabase
          .from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile from Supabase:', profileError);
          // Fallback to localStorage
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              setProfile(parsedProfile);
              setOriginalProfile(parsedProfile);
            } catch (parseError) {
              console.error('Error loading saved profile:', parseError);
            }
          }
          return;
        }

        if (profileData) {
          // Map Supabase profile to UserProfile interface
          const profile = profileData as any;
          const mappedProfile: UserProfile = {
            id: profile.id,
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            company: profileData.company || '',
            position: profileData.position || '',
            title: profileData.title || profileData.position || '',
            website: profileData.website || '',
            linkedIn: profileData.linkedin || '',
            twitter: profileData.twitter,
            avatar: profileData.avatar,
            university: profileData.university || '',
            graduationYear: profileData.graduation_year || '',
            program: profileData.program || '',
            skills: profileData.skills || [],
            expertise: profileData.expertise || [],
            role: profileData.role as UserProfile['role'],
            experience: profileData.experience || 0,
            isVerified: profileData.is_verified || false,
            isOnline: profileData.is_online || false,
            lastActive: profileData.last_active || new Date().toISOString(),
            interests: profileData.interests || [],
            mutualConnections: profileData.mutual_connections || 0,
            responseRate: profileData.response_rate || 0,
            isDiaspora: profileData.is_diaspora || false,
            diasporaLocation: profileData.diaspora_location,
            homeCountry: profileData.home_country,
            availability: profileData.availability as UserProfile['availability'] || {
              mentoring: false,
              collaboration: false,
              consultation: false,
            },
            openTo: profileData.open_to || [],
            socialLinks: profileData.social_links as UserProfile['socialLinks'] || {},
            achievements: profileData.achievements as UserProfile['achievements'] || [],
            universities: profileData.universities as UserProfile['universities'] || [],
            privacy: profileData.privacy as UserProfile['privacy'] || {
              profileVisibility: 'public',
              contactVisibility: 'alumni',
              professionalVisibility: 'public',
            },
            preferences: profileData.preferences as UserProfile['preferences'] || {
              language: 'en',
              timezone: 'UTC',
              theme: 'light',
            },
          };

          setProfile(mappedProfile);
          setOriginalProfile(mappedProfile);
          localStorage.setItem('userProfile', JSON.stringify(mappedProfile));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            setProfile(parsedProfile);
            setOriginalProfile(parsedProfile);
          } catch (parseError) {
            console.error('Error loading saved profile:', parseError);
          }
        }
      }
    };

    loadProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // User logged in - reload profile
        loadProfile();
      } else {
        // User logged out - reset to default
        setProfile(defaultProfile);
        setOriginalProfile(defaultProfile);
        localStorage.removeItem('userProfile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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