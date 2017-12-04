import React from 'react';


const contrastBW = (hex) => {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
  return luminance > 150 ? '#000000' : '#ffffff';
};

const textToColour = (text) => {
  let hash = 17;
  for(let i = 0; i < text.length; ++i) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return `#${'00000'.substring(0, 6 - c.length) + c}`;
};

const TagList = ({ tags }) => {
  const children = tags.map(tag => {
    const backgroundColor = textToColour(tag.attributes.name);
    const style = {
      backgroundColor,
      color: contrastBW(backgroundColor)
    };
    return <span key={tag.id} className="label" style={style}>{tag.attributes.name}</span>;
  });
  return <span>{children}</span>;
};


export default TagList;
