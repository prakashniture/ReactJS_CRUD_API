import React, { useState, useEffect } from "react";
import {
  Table,
  Pagination,
  FormControl,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl =
  "https://crudcrud.com/api/e84f92b0f2bb4a67bea7b1d4fd771fbd/members";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [editMode, setEditMode] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (columnName) => {
    if (sortedColumn === columnName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortedColumn(columnName);
      setSortDirection("asc");
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      });
      if (!response.ok) {
        throw new Error("Failed to add member");
      }
      setShowModal(false);
      setNewMember({ name: "", email: "", age: "", city: "" });
      fetchData();
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  const Sweetalert = () => {
    return Swal.fire({
      title: "Are you sure?",
      text: "If You delete this Member Then this action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
  };

  const handleDeleteMember = async (id) => {
    try {
      const confirmed = await Sweetalert();
      if (confirmed.isConfirmed) {
        const response = await fetch(`${apiUrl}/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete member");
        }
        const updatedData = data.filter((item) => item._id !== id);
        setData(updatedData);
        Swal.fire({
          title: "Deleted!",
          text: "Your member data has been deleted.",
          icon: "success",
        });
        toast.success("Member deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to delete member");
    }
  };

  const handleEditMember = (member) => {
    setEditMode(true);
    setEditMember(member);
    setShowModal(true);
  };

  const handleUpdateMember = async () => {
    try {
      const response = await fetch(`${apiUrl}/${editMember._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editMember),
      });
      if (!response.ok) {
        throw new Error("Failed to update member");
      }
      setShowModal(false);
      setEditMode(false);
      setEditMember(null);
      fetchData();
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = sortedColumn
    ? filteredData.sort((a, b) => {
        const comparison = a[sortedColumn].localeCompare(b[sortedColumn]);
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleChangeItemsPerPage = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      <ToastContainer />
      <FormControl
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        style={{ width: "400px", float: "left", margin: "8px" }}
      />
      <Button
        className="btn btn-success"
        style={{ float: "right" }}
        onClick={() => {
          setEditMode(false);
          setShowModal(true);
        }}
      >
        Add New Member
      </Button>
      <div style={{ marginTop: "10px" }}>
        <Table striped bordered hover>
          <thead>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((columnName) => (
                  <th key={columnName} onClick={() => handleSort(columnName)}>
                    {columnName === "name" ? "Member Name" : columnName}
                  </th>
                ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMember(item._id)}
                  >
                    <i className="bi bi-trash-fill"></i> Delete
                  </Button>{" "}
                  <Button
                    variant="primary"
                    onClick={() => handleEditMember(item)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Pagination>
            {Array.from({
              length: Math.ceil(filteredData.length / itemsPerPage),
            }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
          <div>
            <label htmlFor="itemsPerPage" style={{ marginRight: "8px" }}>
              Show rows:
            </label>
            <Form.Select
              id="itemsPerPage"
              onChange={handleChangeItemsPerPage}
              style={{ width: "130px" }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Member" : "Add New Member"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="memberName">
            <Form.Label>Member Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member Name"
              value={editMode ? editMember.name : newMember.name}
              onChange={(e) =>
                setEditMode
                  ? setEditMember({ ...editMember, name: e.target.value })
                  : setNewMember({ ...newMember, name: e.target.value })
              }
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a name.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="memberEmail">
            <Form.Label>Member Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Member Email"
              value={editMode ? editMember.email : newMember.email}
              onChange={(e) =>
                setEditMode
                  ? setEditMember({ ...editMember, email: e.target.value })
                  : setNewMember({ ...newMember, email: e.target.value })
              }
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email address.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="memberAge">
            <Form.Label>Member Age</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Member Age"
              value={editMode ? editMember.age : newMember.age}
              onChange={(e) =>
                setEditMode
                  ? setEditMember({ ...editMember, age: e.target.value })
                  : setNewMember({ ...newMember, age: e.target.value })
              }
              min="18"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid age (minimum 18).
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="memberCity">
            <Form.Label>Member City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member City"
              value={editMode ? editMember.city : newMember.city}
              onChange={(e) =>
                setEditMode
                  ? setEditMember({ ...editMember, city: e.target.value })
                  : setNewMember({ ...newMember, city: e.target.value })
              }
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a city.
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {editMode ? (
            <Button variant="primary" onClick={handleUpdateMember}>
              Update
            </Button>
          ) : (
            <Button variant="success" onClick={handleAddMember}>
              Submit
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataTable;
