import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "../../api/clients.api";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

export const EditClientModal = ({ isOpen, onClose, client }) => {
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

  useEffect(() => {
    if (client) {
      setFormData({
        representativeName: client?.representativeName || "",
        companyName: client?.companyName || "",
        phone: client?.phone || "",
        address: client?.address || "",
        email: client?.email || "",
        gstNumber: client?.gstNumber || "",
        salesRepName: client?.salesRepName || "",
      });
    }
  }, [client]);

  const mutation = useMutation({
    mutationFn: (data) => updateClient(client._id, data),
    onSuccess: () => {
      toast.success("Client updated successfully!");
      queryClient.invalidateQueries(["clients"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update client");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Client">
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
            value={formData?.companyName}
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
            {mutation.isPending ? "Updating..." : "Update Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
