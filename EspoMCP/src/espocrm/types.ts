export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  emailAddress?: string;
  phoneNumber?: string;
  accountId?: string;
  accountName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
  title?: string;
  department?: string;
}

export interface Account {
  id?: string;
  name: string;
  type?: 'Customer' | 'Investor' | 'Partner' | 'Reseller';
  industry?: string;
  website?: string;
  emailAddress?: string;
  phoneNumber?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
}

export interface Opportunity {
  id?: string;
  name: string;
  accountId: string;
  accountName?: string;
  stage: 'Prospecting' | 'Qualification' | 'Needs Analysis' | 'Value Proposition' | 
         'Id. Decision Makers' | 'Perception Analysis' | 'Proposal/Price Quote' | 'Closed Won' | 'Closed Lost';
  amount?: number;
  closeDate: string;
  probability?: number;
  assignedUserId?: string;
  assignedUserName?: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
  nextStep?: string;
}

export interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  emailAddress?: string;
  phoneNumber?: string;
  accountName?: string;
  website?: string;
  status: 'New' | 'Assigned' | 'In Process' | 'Converted' | 'Recycled' | 'Dead';
  source: 'Call' | 'Email' | 'Existing Customer' | 'Partner' | 'Public Relations' | 'Web Site' | 'Campaign' | 'Other';
  industry?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
}

export interface Task {
  id?: string;
  name: string;
  status: 'Not Started' | 'Started' | 'Completed' | 'Canceled' | 'Deferred';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  dateStart?: string;
  dateEnd?: string;
  dateStartDate?: string;
  dateEndDate?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  parentType?: string;
  parentId?: string;
  parentName?: string;
  createdAt?: string;
  modifiedAt?: string;
  description?: string;
}

export interface Meeting {
  id?: string;
  name: string;
  status: 'Planned' | 'Held' | 'Not Held';
  dateStart: string;
  dateEnd: string;
  location?: string;
  description?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  parentType?: string;
  parentId?: string;
  parentName?: string;
  contacts?: string[];
  users?: string[];
  googleEventId?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface User {
  id?: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  isActive?: boolean;
  type?: 'admin' | 'regular' | 'portal' | 'api';
  createdAt?: string;
  modifiedAt?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface EspoCRMResponse<T = any> {
  total?: number;
  list?: T[];
}

export interface Team {
  id?: string;
  name: string;
  description?: string;
  positionList?: string[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface Role {
  id?: string;
  name: string;
  scope?: string;
  data?: Record<string, any>;
  fieldData?: Record<string, any>;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Call {
  id?: string;
  name: string;
  status: 'Planned' | 'Held' | 'Not Held';
  direction: 'Outbound' | 'Inbound';
  dateStart?: string;
  dateEnd?: string;
  description?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  parentType?: string;
  parentId?: string;
  parentName?: string;
  phoneNumber?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Case {
  id?: string;
  name: string;
  number?: string;
  status: 'New' | 'Assigned' | 'Pending' | 'Closed' | 'Rejected' | 'Duplicate';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  type?: 'Question' | 'Incident' | 'Problem' | 'Feature Request';
  accountId?: string;
  accountName?: string;
  contactId?: string;
  contactName?: string;
  leadId?: string;
  leadName?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  description?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Note {
  id?: string;
  post: string;
  data?: Record<string, any>;
  type?: 'Post';
  parentType?: string;
  parentId?: string;
  parentName?: string;
  createdByName?: string;
  createdById?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface Document {
  id?: string;
  name: string;
  status?: 'Active' | 'Draft' | 'Expired' | 'Canceled';
  type?: string;
  publishDate?: string;
  expirationDate?: string;
  description?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  accountsIds?: string[];
  contactsIds?: string[];
  leadsIds?: string[];
  file?: any;
  createdAt?: string;
  modifiedAt?: string;
}

export interface GenericEntity {
  id?: string;
  [key: string]: any;
}

export interface RelationshipLink {
  id: string;
  name?: string;
  entityType: string;
}

export interface EntityRelationships {
  [relationshipName: string]: RelationshipLink[];
}

export interface WhereClause {
  type: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 
        'greaterThan' | 'lessThan' | 'greaterThanOrEquals' | 'lessThanOrEquals' | 
        'in' | 'notIn' | 'isNull' | 'isNotNull' | 'linkedWith' | 'notLinkedWith' | 
        'and' | 'or';
  attribute?: string;
  value?: any;
}