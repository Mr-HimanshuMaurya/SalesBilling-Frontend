import React from 'react'
import { Layout } from "../../components/layout/Layout.jsx";
import { LeadTable } from "../../components/shared/LeadTable.jsx";

const NewLead = () => {
  return (
    <Layout pageTitle="New Lead">
      <LeadTable />
    </Layout>
  )
}

export default NewLead