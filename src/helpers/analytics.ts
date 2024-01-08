// @ts-ignore
export function analyzeProducts(products: any[]) {
  console.log("Analyzing products...");
  const currentDate = new Date();
  const productStatistics = {
    mostLikelyToExpire: {},
    likelyToBeArchived: {},
    totalValueOfExpired: 0,
    totalProducts: products.length,
    categoryDistribution: {},
    statusDistribution: {
      archived: 0,
      active: 0,
      expired: 0,
    },
  };

  products.forEach((product: any) => {
    // Update category distribution
    productStatistics.categoryDistribution[product.category] =
      (productStatistics.categoryDistribution[product.category] || 0) + 1;

    // Update status distribution
    productStatistics.statusDistribution[product.status]++;

    // Check for products likely to expire or be archived
    const expiryDate = new Date(product.expiry_date);
    if (product.status === "expired") {
      console.log("exp", product);
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
