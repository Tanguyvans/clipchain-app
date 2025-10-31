// Default templates that ship with ClipChain
// These represent the core generation types available

export interface Template {
  id: string
  name: string
  description: string
  emoji: string
  generationType: 'profile' | 'bio' | 'text'
  prompt: string
  gradient: string
  borderColor: string
  iconBg: string
  iconColor: string
  settings?: Record<string, unknown>
}

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'default-profile-dance',
    name: 'Make Your Profile Dance',
    description: 'Watch your profile picture come alive with fun dancing moves and energetic animation',
    emoji: '💃',
    generationType: 'profile',
    prompt: 'Animate this profile picture with subtle, natural movement',
    gradient: 'from-purple-500/10 to-blue-500/10',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    settings: {
      duration: 5,
      style: 'dance'
    }
  },
  {
    id: 'default-bio-speech',
    name: 'Bio Speech Presentation',
    description: 'Watch a professional presenter give a speech about your bio with engaging body language and gestures',
    emoji: '🎤',
    generationType: 'bio',
    prompt: 'Create a professional speech presentation about this bio',
    gradient: 'from-orange-500/10 to-pink-500/10',
    borderColor: 'border-orange-500/30',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    settings: {
      duration: 10,
      style: 'speech'
    }
  },
  {
    id: 'default-custom-text',
    name: 'Custom Text Video',
    description: 'Generate a video from any text prompt you provide',
    emoji: '✨',
    generationType: 'text',
    prompt: '', // User provides their own prompt
    gradient: 'from-green-500/10 to-teal-500/10',
    borderColor: 'border-green-500/30',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    settings: {
      duration: 5,
      style: 'creative'
    }
  }
]

// Get template by ID
export function getTemplateById(id: string): Template | undefined {
  return DEFAULT_TEMPLATES.find(t => t.id === id)
}

// Get templates by generation type
export function getTemplatesByType(type: 'profile' | 'bio' | 'text'): Template[] {
  return DEFAULT_TEMPLATES.filter(t => t.generationType === type)
}
