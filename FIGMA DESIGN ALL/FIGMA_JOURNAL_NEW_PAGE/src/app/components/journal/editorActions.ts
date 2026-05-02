"use server";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  topic: string | null;
  coverUrl: string | null;
  status: "draft" | "published";
  updatedAt: Date;
}

export async function createDraftArticle(): Promise<string> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 300));

  const newId = `article-${Date.now()}`;

  // In real implementation:
  // const article = await db.article.create({
  //   data: {
  //     title: "",
  //     excerpt: "",
  //     content: "",
  //     topic: null,
  //     coverUrl: null,
  //     status: "draft",
  //     workspaceId: session.workspaceId,
  //     authorId: session.userId,
  //   }
  // });

  return newId;
}

export async function getArticle(id: string): Promise<Article> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 200));

  // In real implementation:
  // const article = await db.article.findUnique({
  //   where: { id }
  // });

  return {
    id,
    title: "",
    excerpt: "",
    content: "",
    topic: null,
    coverUrl: null,
    status: "draft",
    updatedAt: new Date(),
  };
}

export async function saveArticle(
  id: string,
  updates: Partial<Article>
): Promise<void> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 500));

  // In real implementation:
  // await db.article.update({
  //   where: { id },
  //   data: updates
  // });

  console.log(`Article ${id} saved:`, updates);
}

export async function publishArticle(id: string): Promise<void> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 800));

  // In real implementation:
  // const article = await db.article.findUnique({ where: { id } });
  //
  // if (!article.title || !article.content || !article.topic) {
  //   throw new Error("Missing required fields");
  // }
  //
  // await db.article.update({
  //   where: { id },
  //   data: {
  //     status: "published",
  //     publishedAt: new Date(),
  //   }
  // });

  console.log(`Article ${id} published`);
}

export async function unpublishArticle(id: string): Promise<void> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 500));

  // In real implementation:
  // await db.article.update({
  //   where: { id },
  //   data: {
  //     status: "draft",
  //     publishedAt: null,
  //   }
  // });

  console.log(`Article ${id} unpublished`);
}

export async function uploadCover(file: File): Promise<string> {
  // Mock implementation - replace with actual file upload
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In real implementation:
  // const buffer = await file.arrayBuffer();
  // const result = await uploadToS3(buffer, file.type);
  // return result.url;

  // Mock URL
  return `https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=400&fit=crop`;
}
