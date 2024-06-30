import swagger from "@elysiajs/swagger";

export const docs = () =>
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "Erp API",
        version: "1.0.0",
        description: `
      This is a description about the api
      `,
      },
      security: [{ cookieAuth: [] }],
      tags: [
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Categories", description: "Categories endpoints" },
        { name: "Products", description: "Products endpoints" },
      ],
    },
  });
