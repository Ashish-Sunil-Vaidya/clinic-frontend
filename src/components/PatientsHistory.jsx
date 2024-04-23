import {
  Button,
  IconButton,
  Input,
  InputGroup,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
// import patientsData from "./data/patients.data";
import { Search2Icon } from "@chakra-ui/icons";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import axios from "axios";

const PatientsHistory = () => {
  const [patientsHistory, setPatientsHistory] = useState([]);
  const { currentUser } = useContext(GlobalContext);
  const toast = useToast();
  const navigator = useNavigate();
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Unauthorized Request",
        description: "Login to access this page.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      navigator("/login");
    }
    axios
      .get("http://localhost:8000/api/v1/users/allPatientDetails")
      .then((response) => setPatientsHistory(response.data.data))
      .catch((error) =>
        toast({
          title: "Unable to fetch Data",
          description: "something went wrong when fetching appointments",
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      );
  }, []);

  const handleSearch = (patientName) => {
    const [name, surname] = patientName.split(" ");
    axios
      .get(`http://localhost:8000/api/v1/users/details/${name}%20${surname}`)
      .then((response) => {
        let endPoint = currentUser.role === 'doctor' ? `/user/doctor/patient/${name}%20${surname}` : `/user/receptionist/patient/update/${name}%20${surname}`
        navigator(endPoint, {
          state: { data: response.data.data },
        });
      })
      .catch((error) =>
        toast({
          title: "Unable to fetch Data",
          description: "something went wrong when fetching appointments",
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      );
  };

  const filteredData = patientsHistory.filter(({ patient_name }) => {
    return patient_name.toLowerCase().includes(searchKey.toLowerCase());
  });

  return (
    <>
      <TableContainer
        bgColor="white"
        boxShadow="0 0 2px 2px rgb(0,0,0,.05)"
        my={10}
        mx={3}
        rounded="md"
      >
        <InputGroup
          width="100%"
          alignItems="center"
          display="flex"
          justifySelf="center"
          p="10px"
          gap={3}
        >
      
          <Input
            type="text"
            fontSize="1.1rem"
            fontWeight="500"
            placeholder="Search Example: Name Surname"
            p="10px"
            width="100%"
            flex={1}
            border="3px solid #e2e8f0"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </InputGroup>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Sr.No.</Th>
              <Th>Name</Th>
              <Th>Mobile</Th>
              <Th>Symptoms</Th>
              <Th>Date</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.length > 0 ? filteredData.map((Patient, index) => {
              return (
                <Tr
                  key={index}
                  _hover={{
                    bg: "cyan.50",
                    cursor: "pointer",
                  }}
                >
                  <Td>{index + 1}</Td>
                  <Td>{Patient.patient_name}</Td>
                  <Td>{Patient.mobile_no}</Td>
                  <Td>{Patient.symptoms}</Td>
                  <Td>
                    {Patient.last_visited?.substring(0, 10) || "Not visited"}
                  </Td>
                  <Td display="flex" justifyContent="center">
                    <Button
                      colorScheme="cyan"
                      alignSelf="center"
                      color="white"
                      onClick={() => {
                        handleSearch(Patient?.patient_name);
                      }}
                    >
                      {currentUser.role === 'doctor' ? "View Details" : "Update Details"}
                    </Button>
                  </Td>
                </Tr>
              );
            }) : <Button colorScheme='teal' size='lg' onClick={() => navigator("/user/receptionist/add-details")}>
            Add Patient Details
          </Button>}
          </Tbody>
        </Table>
      </TableContainer>

    </>
  );
};

export default PatientsHistory;
