// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyDetails {

    // Struct to store property details
    struct Property {
        uint256 tokenId;
        string name;
        string location;
        string size;
        string features;
        address owner;
        string propertyAddress;
        bool forSale;
        string ipfsUrls;
        string description;
    }

    // Mapping to NFT Id
    mapping(uint256 => Property) public properties;

    // Mapping to store properties owned by each address
    mapping(address => Property[]) public ownedPropertiesDetails;

    // Mapping to store the owner of each property
    mapping(uint256 => address) private propertyOwners;

    // Event to emit when a property is enrolled
    event PropertyEnrolled(
                            uint256 indexed tokenId,
                            string name,
                            string location,
                            string size,
                            string features,
                            address owner,
                            string propertyAddress,
                            bool forSale,
                            string description
                        );

    // Counter for generating unique NFT IDs
    uint256 private tokenIdCounter;

    // Function to enroll a new property
    function enrollProperty(
        uint256 _tokenId,
        string memory _name,
        string memory _location,
        string memory _size,
        string memory _features,
        address _owner,
        string memory _propertyAddress,
        bool _forSale,
        string memory _ipfsUrls,
        string memory _description
    ) external {

        // Increment the NFT ID counter
        tokenIdCounter++;

        // Store property details in the mapping
        properties[_tokenId] = Property(
                                            _tokenId,
                                            _name,
                                            _location,
                                            _size,
                                            _features,
                                            _owner,
                                            _propertyAddress,
                                            _forSale,
                                            _ipfsUrls,
                                            _description
                                        );

        // Add the property to the list of properties owned by the owner
        ownedPropertiesDetails[_owner].push(
                                            Property(
                                                _tokenId,
                                                _name,
                                                _location,
                                                _size,
                                                _features,
                                                _owner,
                                                _propertyAddress,
                                                _forSale,
                                                _ipfsUrls,
                                                _description
                                            )
                                        );

        // Assign the property to the owner
        propertyOwners[_tokenId] = _owner;

        // Emit an event indicating the enrollment of the property
        emit PropertyEnrolled(
                                _tokenId,
                                _name,
                                _location,
                                _size,
                                _features,
                                _owner,
                                _propertyAddress,
                                _forSale,
                                _description
                            );
    }

    //Function to retrive all properties owned by an owner with all details
    function getAllOwnedProperties(address _owner) external view returns (Property[] memory) {
        return ownedPropertiesDetails[_owner];
    }

    // Function to get the total number of properties in the system
    function getTotalProperties() external view returns (uint256) {
        return tokenIdCounter;
    }

    //Function to get all properties for sales
    function getAllPropertiesForSale() external view returns (Property[] memory) {
        Property[] memory allSaleProperties = new Property[](tokenIdCounter);
        uint256 salePropertiesCount = 0;

        for (uint256 i = 0; i <= tokenIdCounter; i++) {
            if(properties[i].forSale == true){
                allSaleProperties[salePropertiesCount].tokenId = properties[i].tokenId;
                allSaleProperties[salePropertiesCount].name = properties[i].name;
                allSaleProperties[salePropertiesCount].location = properties[i].location;
                allSaleProperties[salePropertiesCount].size = properties[i].size;
                allSaleProperties[salePropertiesCount].features = properties[i].features;
                allSaleProperties[salePropertiesCount].owner = properties[i].owner;
                allSaleProperties[salePropertiesCount].propertyAddress = properties[i].propertyAddress;
                allSaleProperties[salePropertiesCount].forSale = properties[i].forSale;
                allSaleProperties[salePropertiesCount].ipfsUrls = properties[i].ipfsUrls;
                allSaleProperties[salePropertiesCount].description = properties[i].description;

                salePropertiesCount++;
            }
        }

        // Resize the array to remove any unused elements
        assembly {
            mstore(allSaleProperties, salePropertiesCount)
        }

        return allSaleProperties;
    }

    //Function to make a property available for sale
    function makePropertyForSale(uint256 _id, address _owner) external {
        Property storage prop = properties[_id];
        require(prop.owner == _owner, "You are not allowed to make the changes");

        prop.forSale = true;
        emit PropertyEnrolled(
                                prop.tokenId,
                                prop.name,
                                prop.location,
                                prop.size,
                                prop.features,
                                prop.owner,
                                prop.propertyAddress,
                                prop.forSale,
                                prop.description
                            );
    }

    //Function to make a property not available for sale
    function makePropertyForNoSale(uint256 _id, address _owner) external {
        Property storage prop = properties[_id];
        require(prop.owner == _owner, "You are not allowed to make the changes");

        prop.forSale = false;
        emit PropertyEnrolled(
                                prop.tokenId,
                                prop.name,
                                prop.location,
                                prop.size,
                                prop.features,
                                prop.owner,
                                prop.propertyAddress,
                                prop.forSale,
                                prop.description
                            );
    }

}
