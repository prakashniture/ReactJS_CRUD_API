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

const apiUrl = "https://crudcrud.com/api/a5228dab55254090a35fc87c4737b0a8/members";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [newMember, setNewMember] = useState({ name: "", age: "", city: "" });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl);
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
      if (response.ok) {
        setShowModal(false);
        setNewMember({ name: "", age: "", city: "" });
        fetchData();
      } else {
        console.error("Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
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
        if (response.ok) {
          const updatedData = data.filter((item) => item._id !== id);
          setData(updatedData);
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
        } else {
          console.error("Failed to delete member");
        }
      }
    } catch (error) {
      console.error("Error deleting member:", error);
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

  return (
    <div>
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
        onClick={() => setShowModal(true)}
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
                    <i className="bi bi-trash-fill"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          {Array.from({
            length: Math.ceil(filteredData.length / itemsPerPage),
          }).map((item, index) => (
            <Pagination.Item
              key={index}
              active={index + 1 === currentPage}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="memberName">
            <Form.Label>Member Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member Name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="memberEmail">
            <Form.Label>Member Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member Email"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="memberAge">
            <Form.Label>Member Age</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member Age"
              value={newMember.age}
              onChange={(e) =>
                setNewMember({ ...newMember, age: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="memberCity">
            <Form.Label>Member City</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Member City"
              value={newMember.city}
              onChange={(e) =>
                setNewMember({ ...newMember, city: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="success" onClick={handleAddMember}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataTable;
