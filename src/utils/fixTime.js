const fixSpringBootTime = (springbootTime) => {
  // 解析SpringBoot返回的时间（ISO格式，通常是UTC时间）
  const utcDate = new Date(springbootTime);
  
  // 获取本地时区偏移（分钟）
  const timezoneOffset = utcDate.getTimezoneOffset();
  
  // 正确创建修正后的时间（添加时区偏移）
  // getTimezoneOffset()返回UTC与本地时间的差值，所以需要加上
  const correctedDate = new Date(utcDate.getTime() + (timezoneOffset * 60 * 1000));
  
  return correctedDate;
}

export {fixSpringBootTime}