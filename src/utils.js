
export function isEquivalent(value1, value2) {
  const numericallySimilar = Number.isFinite(value1) && Number.isFinite(value2) && Math.abs(value1 - value2) < 0.001;
  return numericallySimilar || Object.is(value1, value2);
}

export function partition(array, predicate) {
  return array.reduce((result, e) => {
    result[predicate(e) ? 0 : 1].push(e);
    return result;
  }, [[], []]);
}

export function fixed(value) {
  return () => value;
}

export function buildPatchFor(reference) {
  return (patch, item) => {
    if (!isEquivalent(reference[item.index], item.height)) {
      patch[item.index] = item.height;
    }
    return patch;
  };
}

export function createLayoutCalculator(getSize) {
  const cache = {
    offsets: [0],
    filled: 0,
  };

  return (data, index) => {
    let offset = cache.offsets[cache.filled];
    for (let i = cache.filled; i < index; i++) {
      offset += getSize(i);
      cache.offsets[i + 1] = offset;
    }
    offset = cache.offsets[index];
    const length = getSize(index);
    if (index >= cache.filled) {
      cache.offsets[index + 1] = offset + length;
      cache.filled = index + 1;
    }
    return {length, offset, index};
  };
}

export function fitListItems(limit, getSize) {
  let count = 0, length = 0;
  while (length < limit) {
    const size = getSize(count);
    if (size + length > limit) {
      break;
    }
    count += 1;
    length += size;
  }
  return {count, length};
}

export function calculateLength(number, getSize) {
  let length = 0;
  for (let i = 0; i < number; i++) {
    length += getSize(i);
  }
  return length;
}

export function getCurrentPosition(currentOffset, endOffset) {
  // current position in the list: 0 when at the start, 1 when at the end
  return isEquivalent(currentOffset, 0) ? 0 : currentOffset / Math.max(currentOffset, endOffset);
}
