module tokenizer
    implicit none

    contains

    function to_lower(strIn) result(strOut)
        character(len=*), intent(in) :: strIn
        character(len=len(strIn)) :: strOut
        integer :: i, j

        do i = 1, len(strIn)
            j = iachar(strIn(i:i))
            if(j >= iachar("A") .and. j <= iachar("Z")) then
                strOut(i:i) = achar(iachar(strIn(i:i)) + 32)
            else
                strOut(i:i) = strIn(i:i)
            end if
        end do
    end function to_lower

    function nextSym(input, cursor) result(lexeme)
        character(len=*), intent(in) :: input
        integer, intent(inout) :: cursor
        character(len=:), allocatable :: lexeme

        if(iachar(input(cursor:cursor)) >= iachar('0') .and. iachar(input(cursor:cursor)) <= iachar('9')) then
            allocate(character(len=1) :: lexeme)
            lexeme = input(cursor:cursor)
            cursor = cursor + 1
            return
        end if
        
        print *, "error lexico en col ", cursor, ', "'//input(cursor:cursor)//'"'
    end function nextSym
end module tokenizer