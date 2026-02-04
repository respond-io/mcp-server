import { jest } from "@jest/globals";

const mockData = {
  contact: { id: 1, firstName: "Test", lastName: "User", email: "test@example.com" },
  contactList: { items: [], nextCursorId: null },
  contactChannels: { items: [], pagination: { nextCursorId: null } },
  message: { id: 1, text: "Hello", status: "sent" },
  messageList: { items: [], nextCursorId: null },
  users: { items: [], nextCursorId: null },
  user: { id: 1, firstName: "Agent", lastName: "One", email: "agent@example.com", role: "agent" },
  channels: { items: [], pagination: { nextCursorId: null } },
  customField: { id: 1, name: "Field", dataType: "text" },
  customFieldsList: { items: [], pagination: { nextCursorId: null } },
  closingNotes: { items: [], pagination: { nextCursorId: null } },
  templates: { items: [], pagination: { nextCursorId: null } },
  spaceTag: { name: "VIP", description: "VIP customers", colorCode: "#FF5733" },
  success: { success: true, message: "OK" },
  lifecycleResponse: { code: 0, message: "OK" },
};

/** Wraps a value in a Jest mock that resolves to that value (avoids 'never' inference). */
function mockResolvedValue<T>(value: T): jest.Mock {
  return jest.fn().mockResolvedValue(value as never) as jest.Mock;
}

export function createMockSdkClient() {
  return {
    contacts: {
      get: mockResolvedValue(mockData.contact),
      create: mockResolvedValue(mockData.contact),
      update: mockResolvedValue(mockData.contact),
      delete: mockResolvedValue(undefined),
      createOrUpdate: mockResolvedValue(mockData.success),
      merge: mockResolvedValue(mockData.success),
      list: mockResolvedValue(mockData.contactList),
      addTags: mockResolvedValue(undefined),
      deleteTags: mockResolvedValue(undefined),
      listChannels: mockResolvedValue(mockData.contactChannels),
      updateLifecycle: mockResolvedValue(mockData.lifecycleResponse),
    },
    messaging: {
      send: mockResolvedValue(mockData.message),
      get: mockResolvedValue(mockData.message),
      list: mockResolvedValue(mockData.messageList),
    },
    conversations: {
      assign: mockResolvedValue(mockData.success),
      updateStatus: mockResolvedValue(mockData.success),
    },
    comments: {
      create: mockResolvedValue({ id: 1, text: "Comment" }),
    },
    space: {
      listUsers: mockResolvedValue(mockData.users),
      getUser: mockResolvedValue(mockData.user),
      createCustomField: mockResolvedValue(mockData.customField),
      listCustomFields: mockResolvedValue(mockData.customFieldsList),
      getCustomField: mockResolvedValue(mockData.customField),
      listClosingNotes: mockResolvedValue(mockData.closingNotes),
      listChannels: mockResolvedValue(mockData.channels),
      listTemplates: mockResolvedValue(mockData.templates),
      createTag: mockResolvedValue(mockData.spaceTag),
      updateTag: mockResolvedValue(mockData.spaceTag),
      deleteTag: mockResolvedValue({ code: 0, message: "OK" }),
    },
  };
}

export const mockApiModule = () => {
  const mockClient = createMockSdkClient();
  return {
    createSdkClient: jest.fn(() => mockClient),
    handleSdkResponse: (data: unknown) => ({
      content: [{ type: "text", text: JSON.stringify(data) }],
    }),
    handleSdkError: (err: unknown) => ({
      content: [
        {
          type: "text",
          text: err instanceof Error ? err.message : String(err),
        },
      ],
      isError: true,
    }),
    formatContactIdentifier: (id: string) =>
      id.startsWith("id:") ? `id:${id.slice(3)}` : id.includes("@") ? `email:${id}` : `phone:${id}`,
  };
};
