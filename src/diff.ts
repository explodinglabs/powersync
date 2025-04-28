export function diffAndApply(oldNode: Node, newNode: Node): void {
  if (!oldNode || !newNode) {
    console.error("Invalid nodes provided for diffing and applying");
    return;
  }

  // Handle node type mismatch
  if (oldNode.nodeType !== newNode.nodeType) {
    if (
      oldNode.nodeType === Node.ELEMENT_NODE &&
      newNode.nodeType === Node.ELEMENT_NODE
    ) {
      // Handle node type mismatch
      if (oldNode.nodeType !== newNode.nodeType) {
        if (
          oldNode.nodeType === Node.ELEMENT_NODE &&
          newNode.nodeType === Node.ELEMENT_NODE
        ) {
          // Replaces the old element with the new one (cast to Element to access replaceWith)
          (oldNode as Element).replaceWith(newNode);
        }
        return;
      }
    }
    return;
  }

  if (oldNode.nodeType === Node.ELEMENT_NODE) {
    const oldElement = oldNode as HTMLElement;
    const newElement = newNode as HTMLElement;

    // Compare and apply attributes
    const oldAttrs = oldElement.attributes;
    const newAttrs = newElement.attributes;
    const attrDiff: Record<string, string | null> = {};

    // Collect changes for attributes
    if (oldAttrs && newAttrs) {
      Array.from(newAttrs).forEach((attr) => {
        const oldAttr = oldElement.getAttribute(attr.name);
        if (oldAttr !== attr.value) {
          attrDiff[attr.name] = attr.value;
        }
      });

      Array.from(oldAttrs).forEach((attr) => {
        if (!newElement.hasAttribute(attr.name)) {
          attrDiff[attr.name] = null; // Attribute removed
        }
      });

      // Apply attribute changes
      Object.entries(attrDiff).forEach(([key, value]) => {
        if (value === null) {
          oldElement.removeAttribute(key);
        } else {
          oldElement.setAttribute(key, value as string);
        }
      });
    }

    // Compare and apply children
    const oldChildren = oldElement.childNodes;
    const newChildren = newElement.childNodes;
    const maxChildrenLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxChildrenLength; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];

      if (oldChild && newChild) {
        diffAndApply(oldChild, newChild); // Recursively diff and apply for child elements
      } else if (oldChild) {
        oldElement.removeChild(oldChild); // Remove old child
      } else if (newChild) {
        oldElement.appendChild(newChild); // Append new child
      }
    }
  } else if (oldNode.nodeType === Node.TEXT_NODE) {
    // If the node is a text node, compare and apply text content
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
  }
}
