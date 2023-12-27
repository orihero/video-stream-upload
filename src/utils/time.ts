export const getSeconds = (str: string = "60") => {
    let expTime = 0;
  
    let arr = str.split("*");
  
    for (let i = 0; i < arr.length; i++) {
      if (!expTime) {
        expTime = 1;
      }
  
      expTime *= Number(arr[i].trim());
    }
  
    return expTime;
  };
  