import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../api/clients.api";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

export const CreateClientModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    representativeName: "",
    companyName: "",
    phone: "",
    address: "",
    email: "",
    gstNumber: "",
    salesRepName: "",
  });

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully!");
      queryClient.invalidateQueries(["clients"]);
      onClose();
      setFormData({
        representativeName: "",
        companyName: "",
        phone: "",
        address: "",
        email: "",
        gstNumber: "",
        salesRepName: "",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create client");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Client">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Representative Name *"
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            required
          />
          <Input
            label="Company Name "
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
          <Input
            label="Phone *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <Input
            label="GST Number"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
          />
          <Input
            label="Sales Representative Name"
            name="salesRepName"
            value={formData.salesRepName}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
