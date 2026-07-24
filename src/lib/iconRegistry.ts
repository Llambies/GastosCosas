import {
  Bike,
  Bus,
  Car,
  Circle,
  Cloud,
  CreditCard,
  Dumbbell,
  Film,
  Gamepad2,
  HeartPulse,
  Home,
  Laptop,
  Music,
  Phone,
  Plane,
  ShoppingBag,
  Sparkles,
  Tag,
  Tv,
  Utensils,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICON_CATALOG: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "tv", label: "Televisión", Icon: Tv },
  { name: "film", label: "Cine", Icon: Film },
  { name: "music", label: "Música", Icon: Music },
  { name: "gamepad-2", label: "Juegos", Icon: Gamepad2 },
  { name: "cloud", label: "Nube", Icon: Cloud },
  { name: "wifi", label: "Internet", Icon: Wifi },
  { name: "home", label: "Casa", Icon: Home },
  { name: "car", label: "Coche", Icon: Car },
  { name: "bus", label: "Bus", Icon: Bus },
  { name: "bike", label: "Bici", Icon: Bike },
  { name: "plane", label: "Viajes", Icon: Plane },
  { name: "dumbbell", label: "Gym", Icon: Dumbbell },
  { name: "heart-pulse", label: "Salud", Icon: HeartPulse },
  { name: "utensils", label: "Comida", Icon: Utensils },
  { name: "shopping-bag", label: "Compras", Icon: ShoppingBag },
  { name: "credit-card", label: "Tarjeta", Icon: CreditCard },
  { name: "phone", label: "Móvil", Icon: Phone },
  { name: "laptop", label: "Tech", Icon: Laptop },
  { name: "zap", label: "Energía", Icon: Zap },
  { name: "sparkles", label: "Otros", Icon: Sparkles },
  { name: "tag", label: "Etiqueta", Icon: Tag },
  { name: "circle", label: "Círculo", Icon: Circle },
];

const map = new Map(ICON_CATALOG.map((i) => [i.name, i.Icon]));

export function getIcon(name: string): LucideIcon {
  return map.get(name) ?? Circle;
}
