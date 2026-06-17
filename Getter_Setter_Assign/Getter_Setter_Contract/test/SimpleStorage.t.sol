pragma solidity ^0.8.20;
import "forge-std/Test.sol";
import "../src/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage s;

    function setUp() public {
        s = new SimpleStorage();
    }

    function testInitialValueIsZero() public {
        assertEq(s.getValue(), 0);
    }

    function testSetValue() public {
        s.setValue(42);
        assertEq(s.getValue(), 42);
    }

    function testEventEmitted() public {
        vm.expectEmit(true, true, false, false);
        emit SimpleStorage.ValueChanged(100, address(this));
        s.setValue(100);
    }
}
