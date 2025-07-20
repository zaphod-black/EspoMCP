import { Contact, Account, Opportunity, Lead, Task, Meeting, User } from "../espocrm/types.js";

export function formatContactResults(contacts: Contact[]): string {
  if (!contacts || contacts.length === 0) {
    return "No contacts found.";
  }
  
  const formatted = contacts.map(contact => {
    const name = `${contact.firstName} ${contact.lastName}`;
    const email = contact.emailAddress ? ` (${contact.emailAddress})` : '';
    const account = contact.accountName ? ` - ${contact.accountName}` : '';
    const phone = contact.phoneNumber ? ` | Phone: ${contact.phoneNumber}` : '';
    return `${name}${email}${account}${phone}`;
  }).join('\n');
  
  return `Found ${contacts.length} contact${contacts.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatAccountResults(accounts: Account[]): string {
  if (!accounts || accounts.length === 0) {
    return "No accounts found.";
  }
  
  const formatted = accounts.map(account => {
    const type = account.type ? ` (${account.type})` : '';
    const industry = account.industry ? ` | ${account.industry}` : '';
    const website = account.website ? ` | ${account.website}` : '';
    return `${account.name}${type}${industry}${website}`;
  }).join('\n');
  
  return `Found ${accounts.length} account${accounts.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatOpportunityResults(opportunities: Opportunity[]): string {
  if (!opportunities || opportunities.length === 0) {
    return "No opportunities found.";
  }
  
  const formatted = opportunities.map(opp => {
    const amount = opp.amount ? ` | $${formatCurrency(opp.amount)}` : '';
    const probability = opp.probability ? ` | ${opp.probability}%` : '';
    const account = opp.accountName ? ` | ${opp.accountName}` : '';
    return `${opp.name} (${opp.stage})${amount}${probability}${account} | Close: ${opp.closeDate}`;
  }).join('\n');
  
  return `Found ${opportunities.length} opportunit${opportunities.length === 1 ? 'y' : 'ies'}:\n${formatted}`;
}

export function formatLeadResults(leads: Lead[]): string {
  if (!leads || leads.length === 0) {
    return "No leads found.";
  }
  
  const formatted = leads.map(lead => {
    const name = `${lead.firstName} ${lead.lastName}`;
    const email = lead.emailAddress ? ` (${lead.emailAddress})` : '';
    const company = lead.accountName ? ` | ${lead.accountName}` : '';
    const source = ` | Source: ${lead.source}`;
    return `${name}${email} (${lead.status})${company}${source}`;
  }).join('\n');
  
  return `Found ${leads.length} lead${leads.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatTaskResults(tasks: Task[]): string {
  if (!tasks || tasks.length === 0) {
    return "No tasks found.";
  }
  
  const formatted = tasks.map(task => {
    const priority = task.priority !== 'Normal' ? ` [${task.priority}]` : '';
    const assignee = task.assignedUserName ? ` | Assigned: ${task.assignedUserName}` : '';
    const parent = task.parentName ? ` | Related: ${task.parentName}` : '';
    const dueDate = task.dateEnd ? ` | Due: ${formatDate(task.dateEnd)}` : '';
    return `${task.name} (${task.status})${priority}${assignee}${parent}${dueDate}`;
  }).join('\n');
  
  return `Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatContactDetails(contact: Contact): string {
  let details = `Contact Details:\n`;
  details += `Name: ${contact.firstName} ${contact.lastName}\n`;
  
  if (contact.emailAddress) details += `Email: ${contact.emailAddress}\n`;
  if (contact.phoneNumber) details += `Phone: ${contact.phoneNumber}\n`;
  if (contact.title) details += `Title: ${contact.title}\n`;
  if (contact.department) details += `Department: ${contact.department}\n`;
  if (contact.accountName) details += `Account: ${contact.accountName}\n`;
  if (contact.assignedUserName) details += `Assigned User: ${contact.assignedUserName}\n`;
  if (contact.description) details += `Description: ${contact.description}\n`;
  if (contact.createdAt) details += `Created: ${formatDateTime(contact.createdAt)}\n`;
  if (contact.modifiedAt) details += `Modified: ${formatDateTime(contact.modifiedAt)}\n`;
  
  return details.trim();
}

export function formatAccountDetails(account: Account): string {
  let details = `Account Details:\n`;
  details += `Name: ${account.name}\n`;
  
  if (account.type) details += `Type: ${account.type}\n`;
  if (account.industry) details += `Industry: ${account.industry}\n`;
  if (account.website) details += `Website: ${account.website}\n`;
  if (account.emailAddress) details += `Email: ${account.emailAddress}\n`;
  if (account.phoneNumber) details += `Phone: ${account.phoneNumber}\n`;
  if (account.assignedUserName) details += `Assigned User: ${account.assignedUserName}\n`;
  if (account.description) details += `Description: ${account.description}\n`;
  if (account.createdAt) details += `Created: ${formatDateTime(account.createdAt)}\n`;
  if (account.modifiedAt) details += `Modified: ${formatDateTime(account.modifiedAt)}\n`;
  
  return details.trim();
}

export function formatOpportunityDetails(opportunity: Opportunity): string {
  let details = `Opportunity Details:\n`;
  details += `Name: ${opportunity.name}\n`;
  details += `Stage: ${opportunity.stage}\n`;
  details += `Close Date: ${opportunity.closeDate}\n`;
  
  if (opportunity.amount) details += `Amount: $${formatCurrency(opportunity.amount)}\n`;
  if (opportunity.probability) details += `Probability: ${opportunity.probability}%\n`;
  if (opportunity.accountName) details += `Account: ${opportunity.accountName}\n`;
  if (opportunity.assignedUserName) details += `Assigned User: ${opportunity.assignedUserName}\n`;
  if (opportunity.nextStep) details += `Next Step: ${opportunity.nextStep}\n`;
  if (opportunity.description) details += `Description: ${opportunity.description}\n`;
  if (opportunity.createdAt) details += `Created: ${formatDateTime(opportunity.createdAt)}\n`;
  if (opportunity.modifiedAt) details += `Modified: ${formatDateTime(opportunity.modifiedAt)}\n`;
  
  return details.trim();
}

export function formatMeetingResults(meetings: Meeting[]): string {
  if (!meetings || meetings.length === 0) {
    return "No meetings found.";
  }
  
  const formatted = meetings.map(meeting => {
    const dateTime = `${formatDateTime(meeting.dateStart)} - ${formatDateTime(meeting.dateEnd)}`;
    const location = meeting.location ? ` | ${meeting.location}` : '';
    const attendees = meeting.contacts?.length ? ` | ${meeting.contacts.length} attendees` : '';
    return `${meeting.name} (${meeting.status}) | ${dateTime}${location}${attendees}`;
  }).join('\n');
  
  return `Found ${meetings.length} meeting${meetings.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatMeetingDetails(meeting: Meeting): string {
  let details = `Meeting Details:\n`;
  details += `Name: ${meeting.name}\n`;
  details += `Status: ${meeting.status}\n`;
  details += `Start: ${formatDateTime(meeting.dateStart)}\n`;
  details += `End: ${formatDateTime(meeting.dateEnd)}\n`;
  
  if (meeting.location) details += `Location: ${meeting.location}\n`;
  if (meeting.description) details += `Description: ${meeting.description}\n`;
  if (meeting.assignedUserName) details += `Assigned User: ${meeting.assignedUserName}\n`;
  if (meeting.parentName) details += `Related to: ${meeting.parentName}\n`;
  if (meeting.googleEventId) details += `Google Event ID: ${meeting.googleEventId}\n`;
  if (meeting.contacts?.length) details += `Contacts: ${meeting.contacts.length} attendees\n`;
  if (meeting.createdAt) details += `Created: ${formatDateTime(meeting.createdAt)}\n`;
  if (meeting.modifiedAt) details += `Modified: ${formatDateTime(meeting.modifiedAt)}\n`;
  
  return details.trim();
}

export function formatUserResults(users: User[]): string {
  if (!users || users.length === 0) {
    return "No users found.";
  }
  
  const formatted = users.map(user => {
    const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.userName;
    const email = user.emailAddress ? ` (${user.emailAddress})` : '';
    const type = user.type ? ` | ${user.type}` : '';
    const status = user.isActive === false ? ' | Inactive' : '';
    return `${name}${email}${type}${status}`;
  }).join('\n');
  
  return `Found ${users.length} user${users.length === 1 ? '' : 's'}:\n${formatted}`;
}

export function formatUserDetails(user: User): string {
  let details = `User Details:\n`;
  details += `Username: ${user.userName}\n`;
  
  if (user.firstName && user.lastName) details += `Name: ${user.firstName} ${user.lastName}\n`;
  if (user.emailAddress) details += `Email: ${user.emailAddress}\n`;
  if (user.phoneNumber) details += `Phone: ${user.phoneNumber}\n`;
  if (user.type) details += `Type: ${user.type}\n`;
  details += `Active: ${user.isActive !== false ? 'Yes' : 'No'}\n`;
  if (user.createdAt) details += `Created: ${formatDateTime(user.createdAt)}\n`;
  if (user.modifiedAt) details += `Modified: ${formatDateTime(user.modifiedAt)}\n`;
  
  return details.trim();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeString;
  }
}

export function formatLargeResultSet<T>(items: T[], formatter: (items: T[]) => string, maxItems = 20): string {
  if (items.length <= maxItems) {
    return formatter(items);
  }
  
  const displayed = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  
  return formatter(displayed) + `\n... and ${remaining} more item${remaining === 1 ? '' : 's'} (use pagination to see more)`;
}