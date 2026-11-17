(function (global) {
  "use strict";

  const VERSION_SPECS = [
    {data:19,ecc:7,blocks:1},
    {data:34,ecc:10,blocks:1},
    {data:55,ecc:15,blocks:1},
    {data:80,ecc:20,blocks:1},
    {data:108,ecc:26,blocks:1},
    {data:136,ecc:18,blocks:2},
    {data:156,ecc:20,blocks:2},
    {data:194,ecc:24,blocks:2},
    {data:232,ecc:30,blocks:2},
    {data:274,ecc:18,blocks:4},
    {data:324,ecc:20,blocks:4},
    {data:370,ecc:24,blocks:4},
    {data:428,ecc:26,blocks:4},
    {data:461,ecc:30,blocks:4},
    {data:523,ecc:22,blocks:6},
    {data:589,ecc:24,blocks:6},
    {data:647,ecc:28,blocks:6},
    {data:721,ecc:30,blocks:6},
    {data:795,ecc:28,blocks:7},
    {data:861,ecc:28,blocks:8},
    {data:932,ecc:28,blocks:8},
    {data:1006,ecc:28,blocks:9},
    {data:1094,ecc:30,blocks:9},
    {data:1174,ecc:30,blocks:10},
    {data:1276,ecc:26,blocks:12},
    {data:1370,ecc:28,blocks:12},
    {data:1468,ecc:30,blocks:12},
    {data:1531,ecc:30,blocks:13},
    {data:1631,ecc:30,blocks:14},
    {data:1735,ecc:30,blocks:15}
  ];
  const ALIGNMENT_CENTERS = [
    [],
    [6,18],[6,22],[6,26],[6,30],[6,34],
    [6,22,38],[6,24,42],[6,26,46],[6,28,50],
    [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],
    [6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],
    [6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],
    [6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130]
  ];

  function appendBits(target, value, count) {
    for (let bit = count - 1; bit >= 0; bit--) target.push((value >>> bit) & 1);
  }

  function multiply(a, b) {
    let result = 0;
    for (let bit = 7; bit >= 0; bit--) {
      result = (result << 1) ^ ((result >>> 7) * 0x11d);
      result ^= ((b >>> bit) & 1) * a;
    }
    return result;
  }

  function divisor(degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < degree; j++) {
        result[j] = multiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = multiply(root, 2);
    }
    return result;
  }

  function remainder(data, divisorCoefficients) {
    const result = new Array(divisorCoefficients.length).fill(0);
    data.forEach(value => {
      const factor = value ^ result.shift();
      result.push(0);
      for (let i = 0; i < result.length; i++) result[i] ^= multiply(divisorCoefficients[i], factor);
    });
    return result;
  }

  function addErrorCorrection(data, spec) {
    const total = spec.data + spec.ecc * spec.blocks;
    const shortBlocks = spec.blocks - total % spec.blocks;
    const shortDataLength = Math.floor(total / spec.blocks) - spec.ecc;
    const blocks = [];
    let offset = 0;
    for (let i = 0; i < spec.blocks; i++) {
      const length = shortDataLength + (i >= shortBlocks ? 1 : 0);
      const block = data.slice(offset, offset + length);
      offset += length;
      blocks.push({data:block,ecc:remainder(block,divisor(spec.ecc))});
    }
    const result = [];
    const longest = Math.max.apply(null,blocks.map(block => block.data.length));
    for (let i = 0; i < longest; i++) blocks.forEach(block => { if (i < block.data.length) result.push(block.data[i]); });
    for (let i = 0; i < spec.ecc; i++) blocks.forEach(block => result.push(block.ecc[i]));
    return result;
  }

  function dataCodewords(bytes, version, spec) {
    const capacity = spec.data * 8;
    const countBits = version < 10 ? 8 : 16;
    const bits = [];
    appendBits(bits,4,4);
    appendBits(bits,bytes.length,countBits);
    bytes.forEach(value => appendBits(bits,value,8));
    if (bits.length > capacity) throw new RangeError("Certificate details are too long for its QR code.");
    appendBits(bits,0,Math.min(4,capacity-bits.length));
    while (bits.length % 8) bits.push(0);
    const result = [];
    for (let i = 0; i < bits.length; i += 8) {
      let value = 0;
      for (let j = 0; j < 8; j++) value = (value << 1) | bits[i+j];
      result.push(value);
    }
    for (let pad = 0xec; result.length < spec.data; pad ^= 0xec ^ 0x11) result.push(pad);
    return result;
  }

  function makeMatrix(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let version = 1;
    while (version <= VERSION_SPECS.length) {
      const spec = VERSION_SPECS[version-1];
      const countBits = version < 10 ? 8 : 16;
      if (bytes.length < (1 << countBits) && bytes.length * 8 + countBits + 4 <= spec.data * 8) break;
      version++;
    }
    if (version > VERSION_SPECS.length) throw new RangeError("Certificate details exceed the QR code capacity.");

    const spec = VERSION_SPECS[version-1];
    const codewords = addErrorCorrection(dataCodewords(bytes,version,spec),spec);
    const size = version * 4 + 17;
    const modules = Array.from({length:size},() => new Array(size).fill(null));
    const setFunction = (x,y,dark) => { if (x>=0&&y>=0&&x<size&&y<size) modules[y][x]=!!dark; };

    function finder(cx,cy) {
      for (let dy=-4;dy<=4;dy++) for (let dx=-4;dx<=4;dx++) {
        const distance=Math.max(Math.abs(dx),Math.abs(dy));
        setFunction(cx+dx,cy+dy,distance!==2&&distance!==4);
      }
    }
    finder(3,3);
    finder(size-4,3);
    finder(3,size-4);
    for (let i=8;i<size-8;i++) {
      setFunction(6,i,i%2===0);
      setFunction(i,6,i%2===0);
    }
    ALIGNMENT_CENTERS[version-1].forEach(y => ALIGNMENT_CENTERS[version-1].forEach(x => {
      if ((x===6&&y===6)||(x===size-7&&y===6)||(x===6&&y===size-7)) return;
      for (let dy=-2;dy<=2;dy++) for (let dx=-2;dx<=2;dx++) {
        setFunction(x+dx,y+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
      }
    }));

    if (version >= 7) {
      let remainderBits=version;
      for (let i=0;i<12;i++) remainderBits=(remainderBits<<1)^((remainderBits>>>11)*0x1f25);
      const versionBits=(version<<12)|remainderBits;
      for (let i=0;i<18;i++) {
        const bit=((versionBits>>>i)&1)!==0;
        const a=size-11+i%3, b=Math.floor(i/3);
        setFunction(a,b,bit);
        setFunction(b,a,bit);
      }
    }

    function drawFormat(mask) {
      const data=(1<<3)|mask;
      let remainderBits=data;
      for (let i=0;i<10;i++) remainderBits=(remainderBits<<1)^((remainderBits>>>9)*0x537);
      const formatBits=((data<<10)|remainderBits)^0x5412;
      const bit=i=>((formatBits>>>i)&1)!==0;
      for(let i=0;i<=5;i++)setFunction(8,i,bit(i));
      setFunction(8,7,bit(6));
      setFunction(8,8,bit(7));
      setFunction(7,8,bit(8));
      for(let i=9;i<15;i++)setFunction(14-i,8,bit(i));
      for(let i=0;i<8;i++)setFunction(size-1-i,8,bit(i));
      for(let i=8;i<15;i++)setFunction(8,size-15+i,bit(i));
      setFunction(8,size-8,true);
    }
    drawFormat(0);

    const bits=[];
    codewords.forEach(value=>appendBits(bits,value,8));
    let bitIndex=0, upward=true;
    for(let right=size-1;right>=1;right-=2) {
      if(right===6)right=5;
      for(let vert=0;vert<size;vert++) {
        const y=upward?size-1-vert:vert;
        for(let offset=0;offset<2;offset++) {
          const x=right-offset;
          if(modules[y][x]!==null)continue;
          const value=bitIndex<bits.length?bits[bitIndex++]===1:false;
          modules[y][x]=value^((x+y)%2===0);
        }
      }
      upward=!upward;
    }
    drawFormat(0);
    return modules.map(row=>row.map(Boolean));
  }

  function toSvg(text,x,y,size) {
    const matrix=makeMatrix(String(text));
    const extent=matrix.length+8;
    const unit=size/extent;
    const left=Number(x)||0, top=Number(y)||0;
    const squares=[];
    matrix.forEach((row,rowIndex)=>row.forEach((dark,columnIndex)=>{
      if(!dark)return;
      const px=left+(columnIndex+4)*unit, py=top+(rowIndex+4)*unit;
      squares.push(`M${px.toFixed(2)} ${py.toFixed(2)}h${unit.toFixed(2)}v${unit.toFixed(2)}h-${unit.toFixed(2)}z`);
    }));
    return `<g role="img" aria-label="Certificate QR code" shape-rendering="crispEdges"><rect x="${left}" y="${top}" width="${size}" height="${size}" fill="#ffffff"/><path d="${squares.join("")}" fill="#111111"/></g>`;
  }

  global.FieldhouseQR={toSvg:toSvg};
})(window);
