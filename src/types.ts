export type HiddenItem = {
  id: string;
  type: 'lever' | 'treasure' | 'bomb' | 'fossil';
  subtype?: 'skull' | 'ribs' | 'spine' | 'leg'; // For fossil varieties
  x: number; // percentage 0-1
  y: number; // percentage 0-1
  size: number; // percentage based on container width
  discovered: boolean;
  collected: boolean;
  isDefused?: boolean;
  isTriggered?: boolean;
};

export type LevelState = {
  levelNum: number;
  items: HiddenItem[];
};
