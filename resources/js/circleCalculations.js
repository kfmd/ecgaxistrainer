/**
 * @file Angle calculations between mouse/touch position and Cabrera circle center.
 * @author David Schaack (original) — drift bug fixed: getBoundingClientRect replaces offsetLeft/offsetTop
 */

const mouseAngle = (event, domObject) => {
  if (event.clientX !== undefined) {
    return getAngle(domObject, { x: event.pageX, y: event.pageY });
  } else {
    return getAngle(domObject, {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY
    });
  }
};

const getAngle = (domObject, pos) => {
  const relativePos = getRelativePosition(domObject, pos);
  let theta = Math.atan2(relativePos.y, relativePos.x);
  theta = radToDeg(theta);
  return theta >= 0 ? theta : 360 + theta;
};

/**
 * Returns the absolute page-level center of an element using getBoundingClientRect.
 * This correctly handles sticky headers, nested positioned ancestors, and scrolling.
 */
const getAbsoluteCenter = (e) => {
  const rect = e.getBoundingClientRect();
  return {
    x: rect.left + rect.width  / 2 + window.scrollX,
    y: rect.top  + rect.height / 2 + window.scrollY
  };
};

const getRelativePosition = (e, position) => {
  const center = getAbsoluteCenter(e);
  return {
    x: position.x - center.x,
    y: position.y - center.y
  };
};

const radToDeg = (rad) => rad * (180 / Math.PI);
const degToRad = (deg) => deg * Math.PI / 180;

export { mouseAngle };
