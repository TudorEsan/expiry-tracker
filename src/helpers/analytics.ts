import { auth } from "../../firebase.config";
import { NOTIFY_BEFORE } from "../config";
// @ts-ignore
function dateDifferenceInDays(date1, date2) {
  
  const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  const differenceInDays =  Math.abs(Math.floor((utcDate2 - utcDate1) / NOTIFY_BEFORE));
  
  return differenceInDays;
}
export function analyzeProducts(products: any[]) {
  console.log("Analyzing products...");
  const currentDate = new Date();
  const productStatistics = {
    mostRecentExpiredDate: Date,
    mostRecentWonDate: Date,
    valueWonByCategory: Array.from({ length: 5 }, () => 0) as number[],
    valueWonByMonth: Array.from({ length: 12 }, () => 0) as number[],
    valueLostByCategory: Array.from({ length: 5 }, () => 0) as number[],
    valueLostByMonth: Array.from({ length: 12 }, () => 0) as number[],
    mostLikelyToExpire: {} as Record<string, number>,
    likelyToBeArchived: {} as Record<string, number>,
    totalValueOfExpired: 0,
    totalProducts: products.length,
    categoryDistribution: {} as Record<string, number>,
    averageValuePerProduct: 0,
    statusDistribution: {
      archived: 0,
      active: 0,
      expired: 0,
    },
  };
   var differenceDate = 370;
  products.forEach((product: any) => {
   
    // Give the value lost last 365 days
    const expiryDateProd = new Date(product.expiry_date);
    const monthsDifference =
      (currentDate.getFullYear() - expiryDateProd.getFullYear()) * 12 +
      currentDate.getMonth() -
      expiryDateProd.getMonth();

    if (product.status === "expired" && monthsDifference <= 12) {
      // Calculate the month index (0 for current month, 1 for last month, etc.)
      const monthIndex = monthsDifference >= 0 ? monthsDifference : 0;

      // Accumulate the value lost for each month
      productStatistics.valueLostByMonth[monthIndex] += Number(product.value);
    }

    //Give value lost in last year
    // Update category distribution
    productStatistics.categoryDistribution[product.category] =
      (productStatistics.categoryDistribution[product.category] || 0) + 1;

    // Update status distribution
    //@ts-ignore
    productStatistics.statusDistribution[product.status]++;

    // Check for products likely to expire or be archived
   
    if (product.status === "expired" && product.category === "electronics") { 
      productStatistics.valueLostByCategory[0]+= 1
    }
    else if (product.status === "archived" && product.category === "electronics")
    {
      productStatistics.valueWonByCategory[0]+= 1
    }

    if (product.status === "expired" && product.category === "books") { 
      productStatistics.valueLostByCategory[1]+= 1
    }
    else if (product.status === "archived" && product.category === "books")
    {
      productStatistics.valueWonByCategory[1]+= 1
    }

    if (product.status === "expired" && product.category === "clothing") { 
      productStatistics.valueLostByCategory[2]+= 1
    }
    else if (product.status === "archived" && product.category === "clothing")
    {
      productStatistics.valueWonByCategory[2]+= 1
    }

    if (product.status === "expired" && product.category === "home") { 
      productStatistics.valueLostByCategory[3]+= 1
    }
    else if (product.status === "archived" && product.category === "home")
    {
      productStatistics.valueWonByCategory[3]+= 1
    }

    if (product.status === "expired" && product.category === "food") { 
      productStatistics.valueLostByCategory[4]+= 1
    }
    else if (product.status === "archived" && product.category === "food")
    {
      productStatistics.valueWonByCategory[4]+= 1
    }
  
    
    const expiryDate = new Date(product.expiry_date);
    if (product.status === "expired") {
     
      if (dateDifferenceInDays(product.expiry_date,currentDate)<differenceDate)
      {
        differenceDate = dateDifferenceInDays(currentDate,product.expiry_date);
        productStatistics.mostRecentExpiredDate=product.expiry_date;
      }
      if (!productStatistics.mostLikelyToExpire[product.category]) {
        productStatistics.mostLikelyToExpire[product.category] = 1;
      } else {
        productStatistics.mostLikelyToExpire[product.category] += 1;
      }
    }
    if (product.status === "archived") {
      if (!productStatistics.likelyToBeArchived[product.category]) {
        productStatistics.likelyToBeArchived[product.category] = 1;
      } else {
        productStatistics.likelyToBeArchived[product.category] += 1;
      }
      
    if ( monthsDifference <= 12) {
      const monthIndex = monthsDifference >= 0 ? monthsDifference : 0;
      productStatistics.valueWonByMonth[monthIndex] += Number(product.value);
    }
    if (dateDifferenceInDays(product.expiry_date,currentDate)<differenceDate)
      {
        differenceDate = dateDifferenceInDays(currentDate,product.expiry_date);
        productStatistics.mostRecentWonDate=product.expiry_date;
      }
    }
    

    // Calculate total value of expired products
    if (product.status === "expired") {
      productStatistics.totalValueOfExpired += Number(product.value);
    }
  
  });

  // Additional statistics
  productStatistics.averageValuePerProduct =
    products.reduce((acc, product) => acc + Number(product.value), 0) /
    products.length;

  const mostLikelyToExpire = Object.entries(
    productStatistics.mostLikelyToExpire
  ).sort((a, b) => b[1] - a[1])[0]?.[0];

  const likelyToBeArchived = Object.entries(
    productStatistics.likelyToBeArchived
  ).sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    ...productStatistics,
    mostLikelyToExpire,
    likelyToBeArchived,
  };
}
