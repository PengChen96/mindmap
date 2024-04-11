export enum Direction {
  LEFT = -1,
  NONE = 0,
  RIGHT = 1,
}

export interface ImageData {
  src: string;
  width: number;
  height: number;
  gap?: number;
  toward: 'left' | 'right';
}

export interface ButtonData {
  // src?: string;
  // width?: number;
  // height?: number;
  // gap?: number;
  // toward?: 'left' | 'right';
  //
  params?: any;
  onClick?: (buttonData: any) => void
}

export interface NodeData {
  children: string[];
  label: string;
  direction: Direction;
  isRoot?: boolean;
  isExpand?: boolean;
  imageData?: ImageData;
  buttonData?: ButtonData;
  link?: string;
}

export type NodeDataMap = Record<string, NodeData>;
