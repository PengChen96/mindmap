
import Node from './node';
import NodeShape from '../shape/node-shape';
import { createFirstNodeShape } from '../shape/first-node-shape';
import { createGrandchildNodeShape } from '../shape/grandchild-node-shape';
import { createRootNodeShape } from '../shape/root-node-shape';
import { createFirstEdgeShape, FirstEdgeShape } from '../shape/first-edge-shape';
import { createGrandchildEdgeShape, GrandchildEdgeShape } from '../shape/grandchild-edge-shape';
import { getDepthType, DepthType } from '../helper';
import { Direction } from '../types';
import type { RaphaelPaper } from 'raphael';
import type { ImageData, ButtonData } from '../types';

export type EdgeShape = FirstEdgeShape | GrandchildEdgeShape;

// generate Node and Edge for rendering
class ShapeGenerator {
  private readonly paper: RaphaelPaper;
  private readonly depth: number;
  private readonly label: string;
  private readonly father: Node | null = null;
  private readonly imageData: ImageData | null = null;
  private readonly buttonData: ButtonData | null = null;
  private readonly link: string = '';
  private direction: Direction;
  public constructor({
    paper,
    depth,
    label,
    direction,
    father,
    imageData,
    buttonData,
    link,
  }: {
    paper: RaphaelPaper,
    depth: number,
    label: string,
    direction: Direction,
    father: Node | null,
    imageData?: ImageData | null;
    buttonData?: ButtonData | null;
    link?: string;
  }) {
    this.paper = paper;
    this.depth = depth;
    this.label = label;
    this.father = father;
    this.direction = direction;
    this.imageData = imageData || null;
    this.buttonData = buttonData || null;
    this.link = link || '';
  }

  public createNode(x?: number, y?: number): NodeShape {
    const {
      paper,
      depth,
      label,
      imageData,
      buttonData,
      link,
    } = this;

    const nodeOptions = {
      paper,
      x,
      y,
      label,
      imageData,
      buttonData,
      link,
    };

    const depthType = getDepthType(depth);
    if (depthType === DepthType.root) {
      return createRootNodeShape(nodeOptions);
    } else if (depthType === DepthType.firstLevel) {
      return createFirstNodeShape(nodeOptions);
    } else {
      return createGrandchildNodeShape(nodeOptions);
    }
  }

  public createEdge(nodeShape: NodeShape): EdgeShape | null {
    const {
      father,
      direction,
      depth,
    } = this;

    if (!father || !direction) {
      return null;
    }

    const depthType = getDepthType(depth);

    if (depthType === DepthType.firstLevel) {
      return createFirstEdgeShape({
        paper: this.paper,
        sourceBBox: father.getBBox(),
        targetBBox: nodeShape.getBBox(),
        direction,
      })

    } else if (depthType === DepthType.grandchild) {
      return createGrandchildEdgeShape({
        paper: this.paper,
        sourceBBox: father.getBBox(),
        targetBBox: nodeShape.getBBox(),
        direction,
        targetDepth: this.depth,
      })
    }

    return null;
  }

  public changeDirection(direction: Direction) {
    this.direction = direction;
  }
}

export default ShapeGenerator;
