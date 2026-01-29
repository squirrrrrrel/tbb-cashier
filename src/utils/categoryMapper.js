/* ================= API → LOCAL ================= */

export const mapApiResponseToCategory = (apiCategory) => ({
  id:
    apiCategory.id ||
    apiCategory.category_id ||
    apiCategory._id,

  category_name: apiCategory.category_name || apiCategory.name,
  description: apiCategory.description || "",
  img_url: apiCategory.img_url || null,

  created_by: apiCategory.created_by || null,
  updated_by: apiCategory.updated_by || null,

  createdAt: apiCategory.createdAt
    ? new Date(apiCategory.createdAt).getTime()
    : Date.now(),

  updatedAt: apiCategory.updatedAt
    ? new Date(apiCategory.updatedAt).getTime()
    : Date.now(),
});
