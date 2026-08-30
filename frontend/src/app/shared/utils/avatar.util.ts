const AVATAR_COLORS = ['#f97316', '#ec4899', '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b'];

export function getInitials(name: string): string {
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export function getAvatarColor(name: string): string {
    let hash = 0 
    for(let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}