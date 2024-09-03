import React from 'react';
import {Box} from '@admin-bro/design-system'
import {BasePropertyProps} from 'admin-bro'

const Edit: React.FC<BasePropertyProps> = (props)=>{
    const {record} = props;
    const srcImg=record.params['imageUrl']
    
    return(
        <Box>
            {srcImg?(
                <img src={srcImg} style={{height:"65px"}} />
            ):'no image'}
        </Box>
    )
}
export default Edit