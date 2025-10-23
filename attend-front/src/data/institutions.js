/**
 * Institution Data - Schools and Colleges in Ranchi
 */

/* -------------------- ICSE Schools -------------------- */
export const ICSE_SCHOOLS = [
  "St.Xavier's School, Doranda, Ranchi",
  "Loreto Convent School, Doranda, Ranchi",
  "St. Anthony's School, Ranchi",
  "Bishop Westcott Boys' School, Namkum, Ranchi",
  "Bishop Westcott Girls' School, Namkum, Ranchi",
  "Bishop Westcott Girls' School, Doranda, Ranchi",
  "Don Bosco Academy, Ranchi",
  "St. Thomas School, Dhurwa, Ranchi",
  "Ursuline English Medium School, Ranchi",
  "Metas Seventh Day Adventist Higher Secondary School, Ranchi",
  "Carmel School, Ranchi",
  "Bethany Convent School, Ranchi",
  "Bishop Hartmann Academy, Ranchi",
  "Bishop's School, Ranchi",
  "St. Maria School, Ranchi",
];

/* -------------------- CBSE Schools -------------------- */
export const CBSE_SCHOOLS = [
  "Delhi Public School, Ranchi",
  "DAV Public School, Bariatu, Ranchi",
  "DAV Nandraj Public School, Ranchi",
  "Loyola Convent School, Ranchi",
  "Oxford Public School, Ranchi",
  "Army Public School, Dipatoli, Ranchi",
  "Taurian World School, Ranchi",
  "Kairali School, Ranchi",
  "Bridgeford School, Ranchi",
  "Central Academy School, Ranchi",
];

/* -------------------- Colleges / Higher-Education Institutions -------------------- */
export const COLLEGES = [
  "St. Xavier's College, Ranchi",
  "Amity University, Ranchi",
  "Xavier Institute of Social Service (XISS), Ranchi",
  "Birla Institute of Technology, Mesra",
  "Usha Martin University, Ranchi",
  "Sarala Birla University, Ranchi",
  "Dr. Shyama Prasad Mukherjee University, Ranchi",
  "Ranchi University, Ranchi",
  "Central University of Jharkhand, Ranchi",
  "Birsa Agricultural University, Kanke (Ranchi)",
  "Marwari Boys' College, Ranchi",
  "Marwari Girls' College, Ranchi",
  "Gossner College, Ranchi",
  "Nirmala College, Doranda, Ranchi",
  "Maulana Azad College, Ranchi",
  "Doranda College, Ranchi",
  "S.S. Memorial College, Ranchi",
  "J.N. College, Dhurwa, Ranchi",
  "Yogoda Satsanga Mahavidyalaya, Ranchi",
  "Kejriwal Institute of Management & Development Studies, Ranchi",
  "Sai Nath University, Ranchi",
  "Swami Vivekanand Institute of Engineering & Technology, Ranchi",
  "Usha Martin University (Engineering & Technology Campus), Ranchi",
];

/* -------------------- Combined Lists -------------------- */
export const ALL_SCHOOLS = [...ICSE_SCHOOLS, ...CBSE_SCHOOLS].sort();
export const ALL_INSTITUTIONS = [...ALL_SCHOOLS, ...COLLEGES].sort();
