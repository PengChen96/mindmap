import Node from './node/node';
import Viewport from './viewport';
import Selection from './selection/selection';
import { fontSize as rootFontSize } from './shape/root-node-shape';
import { fontSize as firstNodeFontSize } from './shape/first-node-shape';
import { fontSize as grandchildFontSize } from './shape/grandchild-node-shape';
import { DepthType } from './helper';
import DataHandler from './data/data-handler';
import PaperWrapper from './paper-wrapper';
import { isMobile } from './helper';
import React from "react";
import { createRoot } from 'react-dom/client';
import Editor from "./component/Editor";

const fontSizeMap = {
  [DepthType.root]: rootFontSize,
  [DepthType.firstLevel]: firstNodeFontSize,
  [DepthType.grandchild]: grandchildFontSize,
};

class TextEditor {
  private readonly editorWrapperDom: HTMLDivElement;
  private readonly editorDom: HTMLDivElement;
  private readonly viewport: Viewport;
  private readonly dataHandler: DataHandler;
  private node: Node | null = null; // 当前操作的节点，需要看见的时候才算操作
  private isShow: boolean = false;
  private isComposition: boolean = false;
  private editorValue: string | undefined;
  private editor: any;
  public constructor({
    viewport,
    selection,
    dataHandler,
    paperWrapper,
  }: {
    viewport: Viewport;
    selection: Selection;
    dataHandler: DataHandler;
    paperWrapper: PaperWrapper;
  }) {
    this.viewport = viewport;
    this.dataHandler = dataHandler;

    const doms = this.initTextEditorElement(paperWrapper);
    this.editorWrapperDom = doms.editorWrapperDom;
    this.editorDom = doms.editorDom;

    if (isMobile) {
      return;
    }

    selection.on('select', () => {
      const selectNodes = selection.getSelectNodes();

      // If selectNodes has only one and is different, then focus and set label
      if (selectNodes.length === 1 && this.node?.id !== selectNodes[0].id) {
        this.setLabel();

        this.editorDom.focus();
        this.hide();

        this.node = selectNodes[0];
        this.translate();
      } else if (this.node !== null && (selectNodes.length !== 1 || selectNodes[0].id !== this.node.id)) {
        this.setLabel();

        this.editorDom.blur();
        this.hide();

        this.node = null;
      }
    });

    this.editorDom.addEventListener('compositionstart', () => {
      if (!this.isShow) this.show();
      this.isComposition = true;
    });

    this.editorDom.addEventListener('compositionend', () => {
      this.isComposition = false;
    });


    this.editorDom.addEventListener('input', (event: Event) => {
      // @ts-ignore
      const inputValue = event.data;
      if (!this.isShow) {
        if (/\s/.test(inputValue)) {
          this.showBySelectionLabel();
        } else if (this.isEditableKey(inputValue)) {
          this.show();
        } else {
          this.editorDom.innerText = '';
        }
      }
    });
  }

  public showBySelectionLabel(): void {
    console.log('1111', this.node.label);
    const blocks = typeof this.node?.label === "string" ? [{type: "paragraph", content: this.node?.label}] : this.node?.label.filter(v=>v.content.length >0);
    this.editor.removeBlocks(this.editor.document)
    console.log("document", this.editor.document, blocks)
    this.editor.insertBlocks(blocks, this.editor.document[0].id, 'before');

    this.show();
    this.editorDom.innerText = this.node?.label || '';

    // @ts-ignore
    document.execCommand('selectAll', false, null);
    // @ts-ignore
    document.getSelection().collapseToEnd();
  }

  public isShowing(): boolean {
    return this.isShow;
  }

  public finishEdit(): void {
    if (this.isComposition) return;
    this.setLabel();
    this.hide();
  }

  public hide(): void {
    this.editorWrapperDom.style.zIndex = '-9999';
    this.editorDom.innerText = '';
    this.editorValue = '';
    this.isShow = false;
  }


  private show(): void {
    if (this.node === null) return;

    const scale = this.viewport.getScale();
    const fontSize = fontSizeMap[this.node.getDepthType()] * scale;
    this.editorWrapperDom.style.zIndex = '3';
    this.editorDom.style.fontSize = `${fontSize}px`;
    this.translate();
    this.editorDom.focus();

    this.isShow = true;
  }

  private initTextEditorElement(paperWrapper: PaperWrapper): {
    editorWrapperDom: HTMLDivElement;
    editorDom: HTMLDivElement;
  } {
    const editorWrapperDom = document.createElement('div');
    editorWrapperDom.className = 'node-edit-text-wrapper';
    editorWrapperDom.style.height = '300px';
    editorWrapperDom.style.overflow = 'auto';

    const editorDom = document.createElement('div');
    // editorDom.style = 'background: bisque;';

    const editorBox = document.createElement('div');
    const root = createRoot(editorBox);
    root.render(<Editor
      getEditor={(editor: any) => this.editor = editor}
      onChange={(doc: string | undefined) => this.editorValue = doc}
    />);

    // const editorDom = document.createElement('div');
    // editorDom.className = 'node-edit-text';
    // editorDom.setAttribute('contenteditable', 'true');

    const containerDom = paperWrapper.getContainerDom();

    // editorWrapperDom.appendChild(editorDom);
    editorWrapperDom.appendChild(editorBox);
    containerDom.appendChild(editorWrapperDom);

    return {
      editorWrapperDom,
      editorDom,
    }
  }

  private isEditableKey(key: string): boolean {
    const editableOtherKeys = ['`', '-', '=', '[', ']', '\\', ';', '\'', ',', '.', '/'];
    return /^[\w]$/.test(key) || editableOtherKeys.includes(key);
  }

  private translate() {
    if (this.node === null) return;
    // const { cx, cy } = this.node.getLabelBBox();
    const { cx, cy } = this.node.getBBox();
    const { offsetX, offsetY } = this.viewport.getOffsetPosition(cx, cy);
    const scale = this.viewport.getScale();

    const fontSize = fontSizeMap[this.node.getDepthType()];

    const editorDomHeight = (1.4 * fontSize + 6) * scale;

    this.editorWrapperDom.style.left = `${offsetX - 200}px`;
    this.editorWrapperDom.style.top = `${offsetY - editorDomHeight}px`;
  }

  private setLabel(): void {
    const newLabel = this.editorValue || this.editorDom.innerText;
    console.log(newLabel, 'newLabel')
    if (this.node !== null && this.isShow && newLabel !== this.node.label) {
      this.dataHandler.update(this.node.id, {
        label: newLabel,
      });
    }
  }
}

export default TextEditor;
