import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  Collapse,
  List,
  ListItem,
  Link,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

type Intent = { method: string; hash: string; status: string };

interface IntentsDropdownProps {
  data: { intents?: Array<Intent> } | undefined | null;
  isLoading: boolean;
}

const IntentsDropdown: React.FC<IntentsDropdownProps> = ({
  data,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // let data = newData;
  // data.intents = [
  //   {
  //     method: "0x2312",
  //     hash: "0x0cf0ffb1530a31c491a5983d0bcc79269d5f78cc05d4c7c4fa76934c2460e0f4",
  //     status: "ok",
  //   },
  // ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const intents = data?.intents || [];
  const intentsCount = intents.length;
  const pendingCount = intents.filter(
    (intent) => intent.status === undefined
  ).length;

  return (
    <Box>
      <HStack spacing={2} cursor="pointer" onClick={toggleDropdown}>
        <Text
          color={useColorModeValue("blue.600", "blue.300")}
          fontWeight="normal"
        >
          Show {intentsCount} Transactions
        </Text>
        <Icon as={isOpen ? ChevronUpIcon : ChevronDownIcon} />
        <Text color="gray.500" fontSize="sm">
          | {pendingCount} pending
        </Text>
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <Box mt={2} pl={4} borderLeft="1px solid" borderColor="gray.300">
          {isLoading ? (
            <Text>Loading...</Text>
          ) : intentsCount > 0 ? (
            <List spacing={2}>
              {intents.map((intent, index) => (
                <ListItem
                  key={index}
                  sx={{ flexDirection: "row", display: "flex", gap: 1 }}
                >
                  <p>{intent.method} -</p>
                  <Link href={`/tx/${intent.hash}`} color="blue.500" isExternal>
                    {intent.hash}{" "}
                  </Link>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text>No intents available</Text>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default IntentsDropdown;
