// Optimized icon imports to reduce bundle size
// Only import the icons we actually use

export {
  Fuel,
  Globe,
  Activity,
  QrCode,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Settings,
  Users,
  BarChart3,
  Wrench,
  Monitor,
  Zap,
  StopCircle,
  Power,
  Thermometer,
  Gauge,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Menu,
  Home,
} from 'lucide-react';

// Icon sprite configuration for frequently used icons
export const ICON_SPRITES = {
  // Common UI icons
  ui: [
    'Fuel', 'Globe', 'Activity', 'QrCode', 'X', 'Loader2', 
    'CheckCircle', 'AlertTriangle', 'Clock', 'Menu', 'Home'
  ],
  // Hardware control icons
  hardware: [
    'Zap', 'StopCircle', 'Power', 'Thermometer', 'Gauge', 
    'Wifi', 'WifiOff', 'Play', 'Pause', 'RotateCcw'
  ],
  // Analytics icons
  analytics: [
    'BarChart3', 'TrendingUp', 'DollarSign', 'Users'
  ],
  // Navigation icons
  navigation: [
    'ArrowLeft', 'ArrowRight', 'Settings', 'Monitor', 'Wrench'
  ]
};

// Preload critical icons for better performance
export const CRITICAL_ICONS = [
  'Fuel', 'Globe', 'Activity', 'QrCode', 'CheckCircle', 
  'AlertTriangle', 'Loader2', 'X'
];