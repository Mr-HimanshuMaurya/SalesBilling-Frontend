export const formatDate = (date) => 
  new Date(date).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  
export const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR' 
  }).format(amount);
  
export const formatStatus = (status) => ({
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  correction: 'Correction'
}[status] || status);
