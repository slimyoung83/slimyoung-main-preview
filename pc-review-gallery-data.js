/* Local layout study: five added top slots; original thirteen entries preserved.
   column/order: one-based desktop placement; type: portrait or square.
   fit/position control display only; preserveRatio keeps a landscape original.
   Only the user-supplied photo is registered. */
window.SLIMYOUNG_PC_REVIEW_GALLERY = {
  viewMoreUrl: null,
  showPlaceholders: true,
  topItems: [
    {column:1, order:0, type:'square'},
    {column:2, order:0, type:'square'},
    {column:3, order:0, type:'square'},
    {column:4, order:0, type:'square'},
    {column:5, order:0, type:'square'}
  ],
  items: [
    {column:1, order:1, type:'portrait', src:'assets/images/reviews/selfie-review-01.png', alt:'사용자 제공 거울 셀카', fit:'contain', position:'center'},
    {column:1, order:2, type:'portrait'},
    {column:2, order:1, type:'square'},
    {column:2, order:2, type:'portrait'},
    {column:2, order:3, type:'square'},
    {column:3, order:1, type:'portrait'},
    {column:3, order:2, type:'square'},
    {column:3, order:3, type:'portrait'},
    {column:4, order:1, type:'square'},
    {column:4, order:2, type:'portrait'},
    {column:4, order:3, type:'square'},
    {column:5, order:1, type:'portrait'},
    {column:5, order:2, type:'portrait'}
  ]
};
