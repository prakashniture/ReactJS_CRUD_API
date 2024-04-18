import React, { useState, useEffect } from "react";

import {
  Table,
  Pagination,
  FormControl,
  Button,
  Modal,
  Form,
} from "react-bootstrap"; // Components imported from the react-bootstrap

import Swal from "sweetalert2"; //imported swal function from sweetalert

// API for fetch data
const apiUrl =
  "https://crudcrud.com/api/a5228dab55254090a35fc87c4737b0a8/members";

const DataTable = () => {
  const [data, setData] = useState([]); // Stores the array of member data fetched from the API.

  const [currentPage, setCurrentPage] = useState(1); // Stores the current page number for pagination.

  const [itemsPerPage] = useState(5); //Defines the number of items to display per page in the table.

  const [searchTerm, setSearchTerm] = useState("");
  //Stores the current search term entered by the user for filtering data.

  const [sortedColumn, setSortedColumn] = useState(null); //Stores the name of the column by which the data is sorted.

  const [sortDirection, setSortDirection] = useState("asc"); //Stores the sorting direction (ascending or descending).

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
  }); //Stores the data of a new member.

  const [showModal, setShowModal] = useState(false); //Controls the visibility of the modal for adding new members.

  useEffect(() => {
    fetchData();
  }, []);
  //fetch data from the API.

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

  //Updates the currentPage state when a new page is selected
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //Updates the searchTerm state when the user enters a search query.
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  //Updates the sortedColumn and sortDirection states based on the selected column for sorting.
  const handleSort = (columnName) => {
    if (sortedColumn === columnName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortedColumn(columnName);
      setSortDirection("asc");
    }
  };

  // Sends a POST request to the API to add a new member, clears the form, and fetches updated data.
  const handleAddMember = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, // browser needs to know the type of data

        body: JSON.stringify(newMember), //object to json
      });
      if (!response.ok) {
        throw new Error("Failed to add member");
      }
      setShowModal(false);
      setNewMember({ name: "", email: "", age: "", city: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  //Defines a function to display a confirmation dialog using the sweetalert2 library.
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

  //Sends a DELETE request to the API to delete a member, updates the data, and displays a success message.
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
          text: "Your file has been deleted.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  //Filters & show the data array based on the searchTerm.
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  //Sorts the filtered data based on the sortedColumn and sortDirection.
  const sortedData = sortedColumn
    ? filteredData.sort((a, b) => {
        const comparison = a[sortedColumn].localeCompare(b[sortedColumn]);
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredData;

  const indexOfLastItem = currentPage * itemsPerPage; // calculates the index of the last item on the current page by multiplying the currentPage with the itemsPerPage. 5 item on per page.

  const indexOfFirstItem = indexOfLastItem - itemsPerPage; //calculates the index of the first item on the current page by subtracting the itemsPerPage from the indexOfLastItem. show only 5 items on per page.

  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem); //it creates a new array containing only the items to be displayed on the current page.

  return (
    <div>
      {/* Renders a search input field */}
      <FormControl
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        style={{ width: "400px", float: "left", margin: "8px" }}
      />

      {/* add a new member button */}
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
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
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
              value={newMember.age}
              onChange={(e) =>
                setNewMember({ ...newMember, age: e.target.value })
              }
              min="18" // Use min attribute to specify minimum age
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
              value={newMember.city}
              onChange={(e) =>
                setNewMember({ ...newMember, city: e.target.value })
              }
              required
            />

            <Form.Control.Feedback type="invalid">
              Please enter a city.
            </Form.Control.Feedback>
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
