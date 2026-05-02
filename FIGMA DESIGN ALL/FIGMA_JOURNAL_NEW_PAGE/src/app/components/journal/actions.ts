"use server";

export async function createArticle(): Promise<string> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 500));

  const newId = `article-${Date.now()}`;

  // In real implementation:
  // const article = await db.article.create({
  //   data: {
  //     title: null,
  //     content: "",
  //     status: "Entwurf",
  //     workspaceId: session.workspaceId,
  //     authorId: session.userId,
  //   }
  // });

  return newId;
}

export async function deleteArticle(id: string): Promise<void> {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 300));

  // In real implementation:
  // await db.article.delete({
  //   where: { id }
  // });

  console.log(`Article ${id} deleted`);
}

export async function getArticles() {
  // Mock implementation - replace with actual database call
  await new Promise(resolve => setTimeout(resolve, 300));

  // In real implementation:
  // const articles = await db.article.findMany({
  //   where: { workspaceId: session.workspaceId },
  //   orderBy: { updatedAt: "desc" }
  // });

  return [
    {
      id: "article-1",
      title: "Zahngesundheit im Alltag",
      status: "Veröffentlicht" as const,
      topic: "Prävention",
      wordCount: 842,
      publishedAt: new Date("2024-03-15"),
      updatedAt: new Date("2024-03-15"),
    },
    {
      id: "article-2",
      title: null,
      status: "Entwurf" as const,
      topic: null,
      wordCount: 124,
      publishedAt: null,
      updatedAt: new Date("2024-03-20"),
    },
    {
      id: "article-3",
      title: "Moderne Zahnimplantate",
      status: "Veröffentlicht" as const,
      topic: "Behandlung",
      wordCount: 1205,
      publishedAt: new Date("2024-02-28"),
      updatedAt: new Date("2024-03-01"),
    },
  ];
}
