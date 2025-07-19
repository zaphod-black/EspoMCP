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

export interface WhereClause {
  type: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 
        'greaterThan' | 'lessThan' | 'greaterThanOrEquals' | 'lessThanOrEquals' | 
        'in' | 'notIn' | 'isNull' | 'isNotNull' | 'linkedWith' | 'notLinkedWith' | 
        'and' | 'or';
  attribute?: string;
  value?: any;
}