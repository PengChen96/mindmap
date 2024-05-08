import ShapeEventEmitter from './common/shape-event-emitter';
import NodeShapeStyle from './common/node-shape-style';
import { Direction } from '../types';
import { isMobile } from '../helper';
import type { EventNames, EventArgs } from './common/shape-event-emitter';
import type { RaphaelPaper, RaphaelSet, RaphaelElement, RaphaelAxisAlignedBoundingBox, RaphaelAttributes } from 'raphael';
import type { StyleType } from './common/node-shape-style';
import type { ImageData, ButtonData } from '../types';
// @ts-ignore
import eyeFill from "./eyeFill.svg";

const invisibleX = -999999;
const invisibleY = -999999;

const defaultPaddingWidth = 40;
const defaultRectHeight = 37;
const borderPadding = 6;

export interface NodeShapeOptions {
  paper: RaphaelPaper;
  x?: number;
  y?: number;
  label: string;
  paddingWidth?: number;
  rectHeight?: number;
  labelBaseAttr?: Partial<RaphaelAttributes>;
  rectBaseAttr?: Partial<RaphaelAttributes>;
  borderBaseAttr?: Partial<RaphaelAttributes>;
  buttonBaseAttr?: Partial<RaphaelAttributes>;
  imageData?: ImageData | null;
  buttonData?: ButtonData | null;
  link?: string;
}

class NodeShape {
  private readonly paper: RaphaelPaper;
  private readonly shapeSet: RaphaelSet;
  private readonly textShapeSet: RaphaelSet;
  private readonly borderShape: RaphaelElement;
  private readonly labelShape: RaphaelElement;
  private readonly rectShape: RaphaelElement;
  private readonly buttonShape?: RaphaelElement;
  private readonly imageShape: RaphaelElement | null = null;
  private readonly paddingWidth: number;
  private readonly rectHeight: number;
  private readonly shapeEventEmitter: ShapeEventEmitter;
  private readonly nodeShapeStyle: NodeShapeStyle;
  private readonly imageData: ImageData | null = null;
  private readonly buttonData: ButtonData | null = null;
  private label: string;
  private isHide: boolean = false;
  private isHoverInCalled: boolean = false;
  public constructor({
    paper,
    x,
    y,
    label,
    paddingWidth = defaultPaddingWidth,
    rectHeight = defaultRectHeight,
    labelBaseAttr,
    rectBaseAttr,
    borderBaseAttr,
    buttonBaseAttr,
    imageData,
    buttonData,
    link,
  }: NodeShapeOptions) {
    this.paper = paper;
    this.label = typeof label === 'string' ? label.split('\n').map((text) =>({type: "paragraph", content: text})) : label;
    this.paddingWidth = paddingWidth;
    this.rectHeight = rectHeight;

    const hasValidPosition = (x !== undefined && y !== undefined);
    // If there are no x or y, then move shape to the invisible position.
    const shapeX = hasValidPosition ? x : invisibleX;
    const shapeY = hasValidPosition ? y : invisibleY;

    // this.labelShape = paper.text(shapeX, shapeY, label);
    // this.labelShape.attr({
    //   "text-anchor": "start", // 设置文本居左
    // });

    // this.textShape = paper.text(shapeX, shapeY, "label");
    // this.textShapeSet = paper.set()
    //   // .push(this.labelShape)
    //   .push(this.textShape);
    // const labelList = [
    //   {
    //     "id": "5c086956-2eeb-4b33-8c96-a7bd8baf20fd",
    //     "type": "paragraph",
    //     "props": {
    //       "textColor": "default",
    //       "backgroundColor": "default",
    //       "textAlignment": "left",
    //       "level": 1
    //     },
    //     "content": [
    //       {
    //         "type": "text",
    //         "text": "前腾讯",
    //         "styles": {
    //           "text-decoration": "underline"
    //         }
    //       },
    //       {
    //         "type": "text",
    //         "text": "棒球",
    //         "styles": {
    //           "bold": true,
    //           "textColor": "red"
    //         }
    //       }
    //     ],
    //     "children": []
    //   },
    //   {
    //     "id": "5c086956-2eeb-4b33-8c96-a7bd8baf20fd",
    //     "type": "paragraph",
    //     "props": {
    //       "textColor": "default",
    //       "backgroundColor": "default",
    //       "textAlignment": "left",
    //       "level": 1
    //     },
    //     "content": [
    //       {
    //         "type": "text",
    //         "text": "前腾讯22",
    //         "styles": {
    //         }
    //       },
    //       {
    //         "type": "text",
    //         "text": "棒球22",
    //         "styles": {
    //           "bold": true,
    //         }
    //       }
    //     ],
    //     "children": []
    //   }
    // ];
    this.textShapeSet = this.getTextShapeSet({ paper, shapeX, shapeY, labelList: this.label });
    // this.labelShape = this.textShapeSet;
    console.log('textShapeSet',this.textShapeSet.getBBox());
    this.textShapeSet.attr({
      "text-anchor": "start", // 设置文本居左
    });

    this.borderShape = paper.rect(shapeX, shapeY, 0, 0, 4);
    this.rectShape = paper.rect(shapeX, shapeY, 0, 0, 4);
    this.shapeSet = paper.set()
      .push(this.textShapeSet)
      // .push(this.labelShape)
      .push(this.borderShape)
      .push(this.rectShape);

    if (buttonData) {
      // this.buttonShape = paper.rect(shapeX, shapeY, 24, 24, 4);
      this.buttonShape = paper.image(eyeFill, shapeX, shapeY, 24, 24);
      this.buttonShape['mousedown'](() => {
        if (buttonData.onClick) {
          buttonData.onClick(buttonData.params);
        }
      });
      this.shapeSet.push(this.buttonShape);
    }

    if (imageData) {
      this.imageShape = paper.image(imageData.src, shapeX, shapeY, imageData.width, imageData.height);
      this.shapeSet.push(this.imageShape);
    }
    this.imageData = imageData || null;

    if (link) {
      const mousedownEventName = isMobile ? 'touchstart' : 'mousedown';
      this.labelShape[mousedownEventName](() => {
        window.location.href = link;
      });
      this.labelShape.attr({
        stroke: '#3498DB',
      });
      // @ts-ignore
      this.labelShape.node.style.cursor = 'pointer';
    }

    this.nodeShapeStyle = new NodeShapeStyle({
      shapeSet: this.shapeSet,
      labelShape: this.labelShape,
      borderShape: this.borderShape,
      rectShape: this.rectShape,
      buttonShape: this.buttonShape,
      labelBaseAttr,
      rectBaseAttr,
      borderBaseAttr,
      buttonBaseAttr,
    });
    this.nodeShapeStyle.setBaseStyle();

    this.textShapeSet.toFront();
    // this.labelShape?.toFront();
    // @ts-ignore
    // this.labelShape.node.style['user-select'] = 'none';

    this.setPosition(shapeX, shapeY);
    this.shapeEventEmitter = new ShapeEventEmitter(this.shapeSet);

    if (!hasValidPosition) {
      this.hide();
    }

    this.initHover();
  }
  private getValidKeyValueMap = (key="textColor", value="red") => {
    const keyMap = {
      "textColor": "fill",
      "bold": 'font-weight',
      "italic": 'font-style',
      "underline": "text-decoration",
      "strike": "text-decoration",
    }
    const valueMap = {
      textColor: null,
      bold: {
        true: 700
      },
      underline: {
        true: "underline"
      },
      strike: {
        true: "line-through"
      },
      italic: {
        true: "italic"
      }
    }
    return {
      key: keyMap[key] || key,
      value: valueMap[key] ? valueMap[key][value] : value
    }
  }
  private setTextStyle = (shape, label) => {
    shape.node.childNodes.forEach((el, index) => {
      el.removeAttribute('x');
      el.removeAttribute('dy');
      const contentObj = label.content[index];
      if (contentObj && contentObj.styles && Object.keys(contentObj.styles).length > 0) {
        // el.setAttribute('fill', "red");
        Object.keys(contentObj.styles).forEach((key) => {
          const data = this.getValidKeyValueMap(key, contentObj.styles[key]);
          el.setAttribute(data.key, data.value);
        });
      }
    });
  }
  private getFontSize = (label: { props: { level: string | number; }; }) => {
    const fontSizeMap = {
      1: 24,
      2: 20,
      3: 16,
    }
    // @ts-ignore
    return fontSizeMap[label?.props?.level] || 13;
  }
  // @ts-ignore
  private getTextShapeSet({ paper, shapeX, shapeY, labelList }) {
    const textShapeSet = paper.set();
    let _shapeY = shapeY;
    labelList.forEach((label, index) => {
      const contentText = typeof label?.content === 'string' ? label.content : label?.content?.map((v)=>v.text).join('\n');
      if (!contentText) {
        return;
      }
      const fontSize = this.getFontSize(label);
      _shapeY = _shapeY + fontSize + 7;
      const shape = paper.text(shapeX, _shapeY, contentText);
      shape.attr({ 'font-size': fontSize });
      this.setTextStyle(shape, label);
      textShapeSet.push(shape);
    });
    return textShapeSet;
  }

  public getBBox(): RaphaelAxisAlignedBoundingBox {
    return this.rectShape.getBBox();
  }

  public getLabelBBox(): RaphaelAxisAlignedBoundingBox {
    return this.labelShape.getBBox();
  }

  public setLabel(label: string, direction?: Direction): void {
    const bbox = this.getBBox();
    const beforeLabelBBox = this.textShapeSet.getBBox();

    // this.labelShape.attr({
    //   text: JSON.stringify(label),
    // });
    this.textShapeSet.remove();
    let _shapeY = beforeLabelBBox.y;
    label?.forEach((lb) => {
      const content = lb.content.map((v)=>v.text).join('\n');
      if (!content) {
        return;
      }
      const contentText = content || "";
      const fontSize = this.getFontSize(lb);
      _shapeY = _shapeY + fontSize + 7;
      const shape = this.paper.text(beforeLabelBBox.x, _shapeY, contentText);
      shape.attr({ 'font-size': fontSize });
      this.setTextStyle(shape, lb);
      this.textShapeSet.push(shape);
    });
    this.textShapeSet.attr({
      "text-anchor": "start", // 设置文本居左
    });

    const afterLabelBBox = this.textShapeSet.getBBox();
    const diff = afterLabelBBox.width - beforeLabelBBox.width;

    this.setPosition(bbox.x, bbox.y);

    if (direction !== Direction.RIGHT && direction !== Direction.LEFT) {
      this.shapeSet.translate(-diff / 2, 0);
    }

    this.label = label;
  }

  public translateTo(x: number, y: number): void {
    const { x: oldX, y: oldY, } = this.getBBox();
    const dx = x - oldX;
    const dy = y - oldY;

    this.show();

    if (dx === 0 && dy === 0) return;

    this.shapeSet.translate(dx, dy);
  }

  public translate(dx: number, dy: number): void {
    this.shapeSet.translate(dx, dy);
  }

  public setStyle(styleType: StyleType): void {
    this.nodeShapeStyle.setStyle(styleType);
  }

  public getStyle(): StyleType {
    return this.nodeShapeStyle.getStyle();
  }

  public clone(): NodeShape {
    const { x, y } = this.getBBox();
    return new NodeShape({
      paper: this.paper,
      x,
      y,
      label: this.label,
      paddingWidth: this.paddingWidth,
      rectHeight: this.rectHeight,
      ...this.nodeShapeStyle.getBaseAttr(),
    });
  }

  public remove(): void {
    this.shapeSet.remove();
    this.shapeEventEmitter.removeAllListeners();
  }

  public on<T extends EventNames>(eventName: EventNames, ...args: EventArgs<T>): void {
    this.shapeEventEmitter.on(eventName, ...args);
  }

  public show(): void {
    this.shapeSet.show();
    this.isHide = false;
  }

  public hide(): void {
    this.shapeSet.hide();
    this.isHide = true;
  }

  public getIsHide(): boolean {
    return this.isHide;
  }

  public toFront(): void {
    this.borderShape.toFront();
    this.rectShape.toFront();
    this.labelShape?.toFront();
    this.textShapeSet.toFront();
  }

  public isInvisible(): boolean {
    const bbox = this.getBBox();
    return bbox.x === invisibleX && bbox.y === invisibleY;
  }

  private shapeTranslateTo(shape: RaphaelElement | RaphaelSet, x: number, y: number): void {
    const { x: oldX, y: oldY } = shape.getBBox();
    const dx = x - oldX;
    const dy = y - oldY;

    if (dx === 0 && dy === 0) return;

    shape.translate(dx, dy);
  }

  private setPosition(x: number, y: number): void {
    const { borderShape, rectShape, imageShape, textShapeSet, buttonShape, paddingWidth, rectHeight, imageData } = this;

    // const labelBBox = labelShape.getBBox();
    // const paddingHeight = rectHeight - labelBBox.height;
    const paddingHeight = 20;

    const leftShape = imageData?.toward === 'right' ? textShapeSet : imageShape;
    const rightShape = imageData?.toward === 'right' ? imageShape : textShapeSet;
    const defaultBBox = { x: 0, y: 0, width: 0, height: 0 };
    const leftBBox = leftShape?.getBBox() || defaultBBox;
    const rightBBox = rightShape?.getBBox() || defaultBBox;

    const buttonBBox = buttonShape?.getBBox() || defaultBBox;
    let buttonGap = 0;
    if (buttonShape) {
      buttonGap = 8;
    }

    let imageGap = 0;
    if (imageShape) {
      imageGap = (imageData?.gap !== undefined && imageData?.gap >= 0) ? imageData?.gap : 8;
    }

    const contentWidth = leftBBox.width + rightBBox.width + paddingWidth + imageGap + buttonBBox?.width + buttonGap;
    const contentHeight = paddingHeight + Math.max(leftBBox.height, rightBBox.height);

    rectShape.attr({
      width: contentWidth,
      height: contentHeight,
    });

    borderShape.attr({
      width: contentWidth + borderPadding,
      height: contentHeight + borderPadding,
    });

    const leftShapeX = x + (paddingWidth / 2);
    const leftShapeY = y + ((contentHeight - leftBBox.height) / 2);
    const rightShapeX = leftShapeX + leftBBox.width + imageGap;
    const rightShapeY = y + ((contentHeight - rightBBox.height) / 2);

    const buttonShapeX = rightShapeX + rightBBox.width + buttonGap;
    const buttonShapeY = y+6;

    this.shapeTranslateTo(borderShape, x - borderPadding / 2, y - borderPadding / 2);
    leftShape && this.shapeTranslateTo(leftShape, leftShapeX, leftShapeY);
    rightShape && this.shapeTranslateTo(rightShape, rightShapeX, rightShapeY);
    buttonShape && this.shapeTranslateTo(buttonShape, buttonShapeX, buttonShapeY);
  }

  private initHover(): void {
    if (isMobile) return;

    this.shapeEventEmitter.on('hover', () => {
      const curStyleType = this.nodeShapeStyle.getStyle();
      if (curStyleType !== 'select' && curStyleType !== 'disable') {
        this.nodeShapeStyle.setStyle('hover');
        this.isHoverInCalled = true;
      }
    }, () => {
      const curStyleType = this.nodeShapeStyle.getStyle();
      if (this.isHoverInCalled && curStyleType !== 'select' && curStyleType !== 'disable') {
        this.nodeShapeStyle.setStyle('base');
        this.isHoverInCalled = false;
      }
    });
  }
}

export default NodeShape;
